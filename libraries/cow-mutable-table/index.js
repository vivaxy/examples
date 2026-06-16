import { Table, Column } from './table.js';

function log(...args) {
  console.log(...args);
}

const columns = [new Column('col1', ['cell_1_1'])];
const oldTable = new Table('v1', columns, ['row1']);

const newTable = oldTable.clone('v2');
newTable.setCellValue('row1', 'col1', 'cell_1_1_1');
newTable.setCellValue('row1', 'col1', 'cell_1_1_2');
log(oldTable.dump(), newTable.dump());
