/**
 * @since 2024-06-26
 * @author vivaxy
 */
// @ts-expect-error window.TableCore
const { createColumnHelper, createTable, getCoreRowModel } = window.TableCore;

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('firstName', {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: 'lastName',
    cell: (info) => `<i>${info.getValue()}</i>`,
    header: () => `<span>Last Name</span>`,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('age', {
    header: () => 'Age',
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('visits', {
    header: () => `<span>Visits</span>`,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('progress', {
    header: 'Profile Progress',
    footer: (info) => info.column.id,
  }),
];

const data = [
  {
    firstName: 'Tanner',
    lastName: 'Linsley',
    age: 33,
    visits: 100,
    progress: 50,
    status: 'Married',
  },
  {
    firstName: 'Kevin',
    lastName: 'Vandy',
    age: 27,
    visits: 200,
    progress: 100,
    status: 'Single',
  },
];

const table = createTable({
  columns,
  data,
  getCoreRowModel: getCoreRowModel(),
  initialState: {
    columnOrder: ['age', 'firstName', 'lastName'],
    columnVisibility: {
      id: false, //hide the id column by default
    },
    expanded: true, //expand all rows by default
    sorting: [
      {
        id: 'age',
        desc: true, //sort by age in descending order by default
      },
    ],
  },
});

// @ts-expect-error window.table
window.table = table;
console.log(table.getRowModel());
