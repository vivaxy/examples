import {
  Table as TableOwnVersions,
  Column as ColumnOwnVersions,
} from './table-own-versions.js';

import {
  Table as TableClone,
  Column as ColumnClone,
  CellValues as CellValuesClone,
  RowIds as RowIdsClone,
  withMutation,
} from './table-clone.js';

function log(...args) {
  console.log(...args);
}

function tableOwnVersions() {
  const columns = [new ColumnOwnVersions('col1', ['cell_1_1'])];
  const oldTable = new TableOwnVersions('v1', columns, ['row1']);

  const newTable = oldTable.clone('v2');
  newTable.setCellValue('row1', 'col1', 'cell_1_1_1');
  newTable.setCellValue('row1', 'col1', 'cell_1_1_2');
  log(oldTable.dump(), newTable.dump());
}

function tableClone() {
  const cellValues = CellValuesClone.from(['cell_1_1']);
  const columns = [new ColumnClone('col1', cellValues)];
  const rowIds = RowIdsClone.from(['row1']);
  const oldTable = TableClone.create('v1', columns, rowIds);

  withMutation(() => {
    const newTable = oldTable.cloneWithVersion('v2');
    newTable.setCellValue('row1', 'col1', 'cell_1_1_1');
    newTable.setCellValue('row1', 'col1', 'cell_1_1_2');
    log(oldTable.dump(), newTable.dump());
  });
}

tableOwnVersions();
tableClone();
