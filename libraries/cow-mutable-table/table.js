export class Column {
  _ownedVersion = new Map();

  constructor(id, cellValues) {
    this.id = id;
    this._cellValues = cellValues;
  }

  _ownCellValues() {
    if (this._ownedVersion.get('cellValues') !== this._version) {
      this._cellValues = this._cellValues.slice();
      this._ownedVersion.set('cellValues', this._version);
    }
  }

  setCellValue(rowOffset, cellValue) {
    this._ownCellValues();
    this._cellValues[rowOffset] = cellValue;
  }

  setVersion(version) {
    this._version = version;
  }

  setOwnedVersion(ownedVersion) {
    this._ownedVersion = ownedVersion;
  }

  clone(version) {
    if (version === this._version) {
      return this;
    }
    const column = new Column(this.id, this._cellValues);
    column.setVersion(version);
    column.setOwnedVersion(new Map(this._ownedVersion));
    return column;
  }

  dump() {
    return this._cellValues;
  }
}

export class Table {
  _columnMap = new Map();
  _ownedVersion = new Map();

  constructor(version, columns, rowIds) {
    this._version = version;
    columns.forEach((column) => {
      this._columnMap.set(column.id, column);
      column.setVersion(version);
    });
    this._rowIds = rowIds;
    this._ownedVersion.set('columnMap', version);
    this._ownedVersion.set('rowIds', version);
  }

  _ownColumnMap() {
    if (this._ownedVersion.get('columnMap') !== this._version) {
      this._columnMap = new Map(this._columnMap);
      this._ownedVersion.set('columnMap', this._version);
    }
  }

  _ownColumn(colId) {
    this._ownColumnMap();
    const column = this._columnMap.get(colId);
    const newColumn = column.clone(this._version);
    if (column !== newColumn) {
      this._columnMap.set(colId, newColumn);
    }
  }

  setColumnMap(columnMap, version) {
    this._columnMap = columnMap;
    this._ownedVersion.set('columnMap', version);
  }

  setCellValue(rowId, colId, cellValue) {
    this._ownColumn(colId);
    const rowOffset = this._rowIds.indexOf(rowId);
    this._columnMap.get(colId).setCellValue(rowOffset, cellValue);
  }

  clone(newVersion) {
    const newTable = new Table(newVersion, [], this._rowIds);
    newTable.setColumnMap(this._columnMap, this._version);
    return newTable;
  }

  dump() {
    return {
      version: this._version,
      columns: [...this._columnMap.values()].map((column) => {
        return column.dump();
      }),
      rowIds: this._rowIds,
    };
  }
}
