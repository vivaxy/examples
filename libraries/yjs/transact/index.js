/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const TEXT_KEY = 'text-key';

function noTransact() {
  console.log('noTransact', 'start');
  const doc = new Y.Doc();
  const text = doc.getText(TEXT_KEY);
  doc.on('update', function () {
    console.log('update');
  });
  text.insert(0, 'ABC');
  text.insert(0, 'ABC');
  console.log('noTransact', 'end');
}

function withTransact() {
  console.log('withTransact', 'start');
  const doc = new Y.Doc();
  const text = doc.getText(TEXT_KEY);
  doc.on('update', function () {
    console.log('update');
  });
  Y.transact(doc, function () {
    text.insert(0, 'ABC');
    text.insert(0, 'ABC');
  });
  console.log('withTransact', 'end');
}

function nestedTransact() {
  console.log('nestedTransact', 'start');
  const doc = new Y.Doc();
  const text = doc.getText(TEXT_KEY);
  doc.on('update', function () {
    console.log('update');
  });
  doc.on('beforeAllTransactions', function () {
    console.log('beforeAllTransactions');
  });
  doc.on('beforeTransaction', function () {
    console.log('beforeTransaction');
  });
  Y.transact(
    doc,
    function () {
      text.insert(0, 'ABC');
      Y.transact(
        doc,
        function () {
          text.insert(0, 'ABC');
        },
        '2',
      );
    },
    '1',
  );
  console.log('nestedTransact', 'end');
}

noTransact();
withTransact();
nestedTransact();
