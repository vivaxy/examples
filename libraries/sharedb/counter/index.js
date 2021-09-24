/**
 * @since 2021-09-24
 * @author vivaxy
 */
import ShareDB from 'sharedb/lib/client';

const ws = new WebSocket('ws://127.0.0.1:8081/');
const connection = new ShareDB.Connection(ws);
const doc = connection.get('examples', 'counter');
doc.subscribe(render);
doc.on('op', render);

const $value = document.getElementById('value');
const $add = document.getElementById('add');
$add.addEventListener('click', function () {
  doc.submitOp({ p: ['numClicks'], na: 1 });
});

function render() {
  $value.textContent = doc.data.numClicks;
}
