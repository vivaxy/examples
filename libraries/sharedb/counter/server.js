/**
 * @since 2021-09-24
 * @author vivaxy
 */
const ShareDB = require('sharedb');
const { WebSocketServer } = require('ws');
WebSocketJSONStream = require('@teamwork/websocket-json-stream');

function startServer(backend) {
  console.log('server started on http://127.0.0.1:8081');
  const wss = new WebSocketServer({ port: 8081 });

  wss.on('connection', function (ws) {
    const stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });
}

function createDoc() {
  return new Promise(function (resolve) {
    const backend = new ShareDB();
    const connection = backend.connect();
    const doc = connection.get('examples', 'counter');
    doc.fetch(function (err) {
      if (err) {
        reject(err);
        return;
      }
      if (doc.type === null) {
        doc.create({ numClicks: 0 }, function () {
          resolve(backend);
        });
        return;
      }
      resolve(backend);
    });
  });
}

async function main() {
  const doc = await createDoc();
  startServer(doc);
}

main();
