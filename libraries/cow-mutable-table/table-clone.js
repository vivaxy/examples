const cloned = new Set();

export class RowIds extends Array {
  clone() {
    if (cloned.has(this)) {
      return this;
    }
    const newThis = RowIds.from(this);
    cloned.add(newThis);
    return newThis;
  }

  dump() {
    return Array.from(this);
  }
}

export class CellValues extends Array {
  set(offset, value) {
    const newThis = this.clone();
    newThis[offset] = value;
    return newThis;
  }

  clone() {
    if (cloned.has(this)) {
      return this;
    }
    const newThis = CellValues.from(this);
    cloned.add(newThis);
    return newThis;
  }

  dump() {
    return Array.from(this);
  }
}

export class Column {
  constructor(id, cellValues) {
    this.id = id;
    this._cellValues = cellValues;
  }

  setCellValue(rowOffset, cellValue) {
    return this.cloneWithCellValues(this._cellValues.set(rowOffset, cellValue));
  }

  clone() {
    if (cloned.has(this)) {
      return this;
    }
    const newColumn = new Column(this.id, this._cellValues);
    cloned.add(newColumn);
    return newColumn;
  }

  cloneWithCellValues(cellValues) {
    if (cloned.has(this)) {
      this._cellValues = cellValues;
      return this;
    }
    const newColumn = new Column(this.id, cellValues);
    cloned.add(newColumn);
    return newColumn;
  }

  dump() {
    return {
      id: this.id,
      cellValues: this._cellValues.dump(),
    };
  }
}

class ColumnMap extends Map {
  clone() {
    if (cloned.has(this)) {
      return this;
    }
    const newColumnMap = new ColumnMap(this);
    cloned.add(newColumnMap);
    return newColumnMap;
  }

  setCellValue(colId, rowOffset, cellValue) {
    return this.clone().set(
      colId,
      this.get(colId).setCellValue(rowOffset, cellValue),
    );
  }
}

export class Table {
  _columnMap = new ColumnMap();

  constructor(version, columnMap, rowIds) {
    this._version = version;
    this._columnMap = columnMap;
    this._rowIds = rowIds;
  }

  static create(version, columns, rowIds) {
    const columnMap = new ColumnMap();
    columns.forEach((column) => {
      columnMap.set(column.id, column);
    });
    return new Table(version, columnMap, rowIds);
  }

  setCellValue(rowId, colId, cellValue) {
    const rowOffset = this._rowIds.indexOf(rowId);
    return this.cloneWithColumnMap(
      this._columnMap.setCellValue(colId, rowOffset, cellValue),
    );
  }

  clone() {
    if (cloned.has(this)) {
      return this;
    }
    const newTable = new Table(this._version, this._columnMap, this._rowIds);
    cloned.add(newTable);
    return newTable;
  }

  cloneWithVersion(version) {
    if (cloned.has(this)) {
      return this;
    }
    const newTable = new Table(version, this._columnMap, this._rowIds);
    cloned.add(newTable);
    return newTable;
  }

  cloneWithColumnMap(columnMap) {
    if (cloned.has(this)) {
      this._columnMap = columnMap;
      return this;
    }
    const newTable = new Table(this._version, columnMap, this._rowIds);
    cloned.add(newTable);
    return newTable;
  }

  dump() {
    return {
      version: this._version,
      columns: [...this._columnMap.values()].map((column) => {
        return column.dump();
      }),
      rowIds: this._rowIds.dump(),
    };
  }
}

export function withMutation(mutator) {
  cloned.clear();
  mutator();
  cloned.clear();
}
