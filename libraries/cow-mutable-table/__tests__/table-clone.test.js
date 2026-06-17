import { CellValues, Column, Table, withMutation } from '../table-clone.js';

function makeTable() {
  const col1 = new Column('col1', CellValues.from(['cell_1_1', 'cell_2_1']));
  const col2 = new Column('col2', CellValues.from(['cell_1_2', 'cell_2_2']));
  return Table.create('v1', [col1, col2], ['row1', 'row2']);
}

describe('withMutation', () => {
  it('runs the provided mutator function', () => {
    // Arrange
    let called = false;

    // Act
    withMutation(() => {
      called = true;
    });

    // Assert
    expect(called).toBe(true);
  });

  it('clears cloned set after mutator completes: cloning a previously-cloned object creates a new instance', () => {
    // Arrange
    const col = new Column('col1', CellValues.from(['a']));
    let inner;
    withMutation(() => {
      inner = col.clone();
    });

    // Act — cloned set is now cleared, so inner is no longer tracked
    const outer = inner.clone();

    // Assert
    expect(outer).not.toBe(inner);
  });
});

describe('Column', () => {
  describe('constructor', () => {
    it('stores id and CellValues', () => {
      // Arrange / Act
      const col = new Column('col1', CellValues.from(['a', 'b']));

      // Assert
      expect(col.id).toBe('col1');
      expect(col.dump()).toEqual({ id: 'col1', cellValues: ['a', 'b'] });
    });
  });

  describe('dump()', () => {
    it('returns current id and cell values as plain array', () => {
      // Arrange
      const col = new Column('col1', CellValues.from(['x', 'y']));

      // Assert
      expect(col.dump()).toEqual({ id: 'col1', cellValues: ['x', 'y'] });
    });
  });

  describe('clone() outside withMutation', () => {
    it('always returns a new instance', () => {
      // Arrange
      const col = new Column('col1', CellValues.from(['a', 'b']));

      // Act
      const cloned = col.clone();

      // Assert
      expect(cloned).not.toBe(col);
    });

    it('clone has the same id and cell values', () => {
      // Arrange
      const col = new Column('col1', CellValues.from(['a', 'b']));

      // Act
      const cloned = col.clone();

      // Assert
      expect(cloned.dump()).toEqual({ id: 'col1', cellValues: ['a', 'b'] });
    });

    it('clone shares the same _cellValues reference initially (lazy copy)', () => {
      // Arrange
      const col = new Column('col1', CellValues.from(['a', 'b']));

      // Act
      const cloned = col.clone();

      // Assert
      expect(cloned._cellValues).toBe(col._cellValues);
    });
  });

  describe('setCellValue() outside withMutation', () => {
    it('returns a new Column with the updated value', () => {
      // Arrange
      const col = new Column('col1', CellValues.from(['a', 'b', 'c']));

      // Act
      const updated = col.setCellValue(1, 'B');

      // Assert
      expect(updated.dump()).toEqual({
        id: 'col1',
        cellValues: ['a', 'B', 'c'],
      });
    });

    it('original Column is unchanged', () => {
      // Arrange
      const col = new Column('col1', CellValues.from(['a', 'b']));

      // Act
      col.setCellValue(0, 'X');

      // Assert
      expect(col.dump()).toEqual({ id: 'col1', cellValues: ['a', 'b'] });
    });

    it('each call returns a different instance', () => {
      // Arrange
      const col = new Column('col1', CellValues.from(['a']));

      // Act
      const r1 = col.setCellValue(0, 'x');
      const r2 = col.setCellValue(0, 'y');

      // Assert
      expect(r1).not.toBe(col);
      expect(r2).not.toBe(col);
      expect(r1).not.toBe(r2);
    });
  });

  describe('COW: withMutation', () => {
    it('clone inside withMutation returns a new instance on first call', () => {
      // Arrange
      const col = new Column('col1', CellValues.from(['a']));
      let cloned;

      // Act
      withMutation(() => {
        cloned = col.clone();
      });

      // Assert
      expect(cloned).not.toBe(col);
    });

    it('setCellValue on clone inside withMutation returns the same clone instance', () => {
      // Arrange
      const col = new Column('col1', CellValues.from(['a', 'b']));
      let cloned, result;

      // Act
      withMutation(() => {
        cloned = col.clone();
        result = cloned.setCellValue(0, 'A');
      });

      // Assert — no extra copy, mutation was in-place
      expect(result).toBe(cloned);
    });

    it('original Column is unchanged after withMutation', () => {
      // Arrange
      const col = new Column('col1', CellValues.from(['a', 'b']));

      // Act
      withMutation(() => {
        const c = col.clone();
        c.setCellValue(0, 'X');
      });

      // Assert
      expect(col.dump()).toEqual({ id: 'col1', cellValues: ['a', 'b'] });
    });

    it('multiple setCellValue calls on clone reuse the same _cellValues array', () => {
      // Arrange
      const col = new Column('col1', CellValues.from(['a', 'b']));
      let cloned;

      // Act
      withMutation(() => {
        cloned = col.clone();
        cloned.setCellValue(0, 'A');
        const arrayAfterFirst = cloned._cellValues;

        cloned.setCellValue(1, 'B');

        // Assert — no second CellValues copy created
        expect(cloned._cellValues).toBe(arrayAfterFirst);
      });

      expect(cloned.dump()).toEqual({ id: 'col1', cellValues: ['A', 'B'] });
    });
  });
});

describe('Table', () => {
  describe('create()', () => {
    it('stores all columns accessible by id', () => {
      // Arrange / Act
      const table = makeTable();

      // Assert
      expect(table._columnMap.get('col1').dump()).toEqual({
        id: 'col1',
        cellValues: ['cell_1_1', 'cell_2_1'],
      });
      expect(table._columnMap.get('col2').dump()).toEqual({
        id: 'col2',
        cellValues: ['cell_1_2', 'cell_2_2'],
      });
    });

    it('stores rowIds', () => {
      // Arrange / Act
      const table = makeTable();

      // Assert
      expect(table._rowIds).toEqual(['row1', 'row2']);
    });
  });

  describe('setCellValue() outside withMutation', () => {
    it('returns a new Table with the updated cell value', () => {
      // Arrange
      const table = makeTable();

      // Act
      const updated = table.setCellValue('row2', 'col1', 'updated');

      // Assert
      expect(updated._columnMap.get('col1').dump().cellValues).toEqual([
        'cell_1_1',
        'updated',
      ]);
    });

    it('returns a different Table instance', () => {
      // Arrange
      const table = makeTable();

      // Act
      const updated = table.setCellValue('row1', 'col1', 'x');

      // Assert
      expect(updated).not.toBe(table);
    });

    it('original Table is unchanged', () => {
      // Arrange
      const table = makeTable();

      // Act
      table.setCellValue('row1', 'col1', 'x');

      // Assert
      expect(table._columnMap.get('col1').dump().cellValues).toEqual([
        'cell_1_1',
        'cell_2_1',
      ]);
    });
  });

  describe('clone() outside withMutation', () => {
    it('returns a new Table instance', () => {
      // Arrange
      const table = makeTable();

      // Act
      const cloned = table.clone();

      // Assert
      expect(cloned).not.toBe(table);
    });

    it('cloned Table shares the same _columnMap reference initially', () => {
      // Arrange
      const table = makeTable();

      // Act
      const cloned = table.clone();

      // Assert
      expect(cloned._columnMap).toBe(table._columnMap);
    });
  });

  describe('COW: withMutation', () => {
    it('setCellValue on clone inside withMutation does not affect original', () => {
      // Arrange
      const table = makeTable();

      // Act
      withMutation(() => {
        const t2 = table.clone();
        t2.setCellValue('row1', 'col1', 'new_value');
      });

      // Assert
      expect(table._columnMap.get('col1').dump().cellValues).toEqual([
        'cell_1_1',
        'cell_2_1',
      ]);
    });

    it('setCellValue on clone inside withMutation returns the same clone instance', () => {
      // Arrange
      const table = makeTable();
      let t2, result;

      // Act
      withMutation(() => {
        t2 = table.clone();
        result = t2.setCellValue('row1', 'col1', 'A');
      });

      // Assert — mutation was in-place, no extra Table copy
      expect(result).toBe(t2);
    });

    it('multiple setCellValue calls on clone reuse the same Column and CellValues', () => {
      // Arrange
      const table = makeTable();
      let t2;

      // Act
      withMutation(() => {
        t2 = table.clone();
        t2.setCellValue('row1', 'col1', 'A');
        const colAfterFirst = t2._columnMap.get('col1');
        const arrayAfterFirst = colAfterFirst._cellValues;

        t2.setCellValue('row2', 'col1', 'B');

        // Assert — no second Column or CellValues copy created
        expect(t2._columnMap.get('col1')).toBe(colAfterFirst);
        expect(t2._columnMap.get('col1')._cellValues).toBe(arrayAfterFirst);
      });

      expect(t2._columnMap.get('col1').dump().cellValues).toEqual(['A', 'B']);
    });

    it('after withMutation, cloning the result creates a new instance', () => {
      // Arrange
      const table = makeTable();
      let t2;
      withMutation(() => {
        t2 = table.clone();
      });

      // Act — cloned set is cleared; t2 is no longer tracked
      const t3 = t2.clone();

      // Assert
      expect(t3).not.toBe(t2);
    });
  });
});
