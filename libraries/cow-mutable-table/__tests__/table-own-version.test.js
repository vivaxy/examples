import { Column, Table } from '../table-own-versions.js';

describe('Column', () => {
  describe('constructor', () => {
    it('sets id and cellValues', () => {
      const col = new Column('col1', ['a', 'b']);
      expect(col.id).toBe('col1');
      expect(col.dump()).toEqual({ id: 'col1', cellValues: ['a', 'b'] });
    });
  });

  describe('dump()', () => {
    it('returns current cell values', () => {
      const col = new Column('col1', ['x']);
      expect(col.dump()).toEqual({ id: 'col1', cellValues: ['x'] });
    });
  });

  describe('setCellValue()', () => {
    it('updates the value at the given row offset', () => {
      const col = new Column('col1', ['a', 'b', 'c']);
      col.setVersion('v1');
      col.setCellValue(1, 'B');
      expect(col.dump()).toEqual({ id: 'col1', cellValues: ['a', 'B', 'c'] });
    });
  });

  describe('clone()', () => {
    it('returns the same instance when cloned with the same version', () => {
      const col = new Column('col1', ['a']);
      col.setVersion('v1');
      expect(col.clone('v1')).toBe(col);
    });

    it('returns a new instance when cloned with a different version', () => {
      const col = new Column('col1', ['a']);
      col.setVersion('v1');
      const cloned = col.clone('v2');
      expect(cloned).not.toBe(col);
      expect(cloned.id).toBe(col.id);
    });

    it('new instance initially shares the cellValues array (lazy clone)', () => {
      const col = new Column('col1', ['a']);
      col.setVersion('v1');
      const cloned = col.clone('v2');
      // Before any write, both share the same underlying array reference
      expect(cloned._cellValues).toBe(col._cellValues);
    });
  });

  describe('COW: cellValues array', () => {
    it('clones cellValues on first write after version change', () => {
      const col = new Column('col1', ['a']);
      col.setVersion('v1');
      const cloned = col.clone('v2');

      const originalArray = col._cellValues;
      cloned.setCellValue(0, 'b');

      // Clone now owns its own copy
      expect(cloned._cellValues).not.toBe(originalArray);
      // Original is untouched
      expect(col.dump().cellValues).toEqual(['a']);
      expect(cloned.dump().cellValues).toEqual(['b']);
    });

    it('does not re-clone cellValues on subsequent writes in the same version', () => {
      const col = new Column('col1', ['a', 'b']);
      col.setVersion('v1');
      const cloned = col.clone('v2');

      cloned.setCellValue(0, 'A');
      const arrayAfterFirstWrite = cloned._cellValues;

      cloned.setCellValue(1, 'B');
      // Second write must reuse the same array — no extra clone
      expect(cloned._cellValues).toBe(arrayAfterFirstWrite);
      expect(cloned.dump().cellValues).toEqual(['A', 'B']);
    });
  });
});

describe('Table', () => {
  function makeTable() {
    const col1 = new Column('col1', ['cell_1_1', 'cell_2_1']);
    const col2 = new Column('col2', ['cell_1_2', 'cell_2_2']);
    return new Table('v1', [col1, col2], ['row1', 'row2']);
  }

  describe('constructor', () => {
    it('registers all columns and rowIds', () => {
      const table = makeTable();
      const dumped = table.dump();
      expect(dumped.version).toBe('v1');
      expect(dumped.rowIds).toEqual(['row1', 'row2']);
      expect(dumped.columns).toEqual([
        { id: 'col1', cellValues: ['cell_1_1', 'cell_2_1'] },
        { id: 'col2', cellValues: ['cell_1_2', 'cell_2_2'] },
      ]);
    });
  });

  describe('dump()', () => {
    it('returns version, columns, and rowIds', () => {
      const table = makeTable();
      const dumped = table.dump();
      expect(dumped).toEqual({
        version: 'v1',
        columns: [
          { id: 'col1', cellValues: ['cell_1_1', 'cell_2_1'] },
          { id: 'col2', cellValues: ['cell_1_2', 'cell_2_2'] },
        ],
        rowIds: ['row1', 'row2'],
      });
    });
  });

  describe('setCellValue()', () => {
    it('updates the correct cell by rowId and colId', () => {
      const table = makeTable();
      table.setCellValue('row2', 'col1', 'updated');
      expect(table.dump().columns[0].cellValues).toEqual([
        'cell_1_1',
        'updated',
      ]);
    });
  });

  describe('clone()', () => {
    it('returns a Table instance (not undefined)', () => {
      const table = makeTable();
      const cloned = table.clone('v2');
      expect(cloned).toBeInstanceOf(Table);
    });

    it('cloned table has the new version', () => {
      const table = makeTable();
      const cloned = table.clone('v2');
      expect(cloned.dump().version).toBe('v2');
    });

    it('cloned table shares the same initial column data', () => {
      const table = makeTable();
      const cloned = table.clone('v2');
      expect(cloned.dump().columns).toEqual(table.dump().columns);
    });
  });

  describe('COW: mutating clone does not affect original', () => {
    it('setCellValue on clone leaves original unchanged', () => {
      const table = makeTable();
      const cloned = table.clone('v2');

      cloned.setCellValue('row1', 'col1', 'new_value');

      expect(table.dump().columns[0].cellValues).toEqual([
        'cell_1_1',
        'cell_2_1',
      ]);
      expect(cloned.dump().columns[0].cellValues).toEqual([
        'new_value',
        'cell_2_1',
      ]);
    });

    it('multiple edits to clone leave original unchanged', () => {
      const table = makeTable();
      const cloned = table.clone('v2');

      cloned.setCellValue('row1', 'col1', 'edit1');
      cloned.setCellValue('row1', 'col1', 'edit2');

      expect(table.dump().columns[0].cellValues).toEqual([
        'cell_1_1',
        'cell_2_1',
      ]);
      expect(cloned.dump().columns[0].cellValues).toEqual([
        'edit2',
        'cell_2_1',
      ]);
    });
  });

  describe('COW: multiple edits in same version reuse the owned column', () => {
    it('column cellValues array is only cloned once across multiple writes', () => {
      const table = makeTable();
      const cloned = table.clone('v2');

      cloned.setCellValue('row1', 'col1', 'A');
      const arrayAfterFirstWrite = cloned._columnMap.get('col1')._cellValues;

      cloned.setCellValue('row2', 'col1', 'B');
      const arrayAfterSecondWrite = cloned._columnMap.get('col1')._cellValues;

      // Same array — no second clone
      expect(arrayAfterSecondWrite).toBe(arrayAfterFirstWrite);
      expect(cloned.dump().columns[0].cellValues).toEqual(['A', 'B']);
    });
  });
});
