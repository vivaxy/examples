let mutation = false;
const cloned = new Set();

class RowIds extends Array {
  clone() {
    if (cloned.has(this)) {
      return this;
    }
    return this.slice();
  }

  dump() {
    return this.slice();
  }
}

class CellValues extends Array {
  set(offset, value) {
    const newThis = this.clone();
    newThis[rowOffset] = value;
    return newThis;
  }

  clone() {
    if (cloned.has(this)) {
      return this;
    }
    return this.slice();
  }

  dump() {
    return this.slice();
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
    return new Column(id, this._cellValues);
  }

  cloneWithCellValues(cellValues) {
    if (cloned.has(this)) {
      return this;
    }
    return new Column(id, cellValues);
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
  _version = 0;
  _rowIds = new RowIds();
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

  withMutation(mutate) {
    mutation = true;
    cloned.clear();
    mutate();
    cloned.clear();
    mutation = false;
  }

  setCellValue(rowId, colId, cellValue) {
    const rowOffset = this._rowIds.indexOf(rowId);
    return this.cloneWithColumnMap(
      this._columnMap.setCellValue(rowId, rowOffset, cellValue),
    );
  }

  clone() {
    if (cloned.has(this)) {
      return this;
    }
    return new Table(this._version, this._columnMap, this._rowIds);
  }

  cloneWithColumnMap(columnMap) {
    if (cloned.has(this)) {
      return this;
    }
    return new Table(this._version, columnMap, this._rowIds);
  }
}

const newDataCore = dataCore.clone();
withMutation(() => {
  newDataCore.setCellValue('row1', 'col1', 'newCell1');
  newDataCore.setCellValue('row1', 'col1', 'newCell2');
});
