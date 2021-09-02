/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';
import { toJSON, DATA_TYPES } from '../data-visualization/src/data-viewer';

const TEXT_KEY = 'text';

function createUser(userIndex) {
  const yDoc = new Y.Doc();
  yDoc.clientID = userIndex;
  const updates = [];
  yDoc.on('update', function (update) {
    updates.push(update);
  });
  const text = yDoc.get(TEXT_KEY, Y.XmlText);
  return {
    yDoc,
    text,
    shiftUpdate() {
      return updates.shift();
    },
  };
}

const users = Array.from({ length: 3 }, function (_, i) {
  return createUser(i);
});

function textEqual(_users = users) {
  const textString = _users[0].text.toString();
  for (let i = 1; i < _users.length; i++) {
    if (_users[i].text.toString() !== textString) {
      return false;
    }
  }
  return true;
}

function applyUpdate(update, userIndex) {
  Y.applyUpdate(users[userIndex].yDoc, update);
}

function logText(userIndex) {
  function serializeContent(content) {
    if (content.type === DATA_TYPES.CONTENT_FORMAT) {
      if (content.value) {
        return `<${content.key}>`;
      }
      return `</${content.key}>`;
    }
    if (content.type === DATA_TYPES.CONTENT_DELETED) {
      return 'DEL';
    }
    if (content.type === DATA_TYPES.CONTENT_STRING) {
      if (content.string === '\n') {
        return '\\n';
      }
      return content.string;
    }
    throw new Error('Unexpected case');
  }

  const json = toJSON(users[userIndex].text, Y);
  const res = json.xmlText.map(function ({ client, clock, content }) {
    return `(${client}, ${clock}, ${serializeContent(content)})`;
  });
  console.log(`User ${userIndex}:`, res.join('➜'));
}

function syncAll() {
  users.forEach(function (user, userIndex) {
    let update;
    while ((update = user.shiftUpdate())) {
      users.forEach(function (_user, _userIndex) {
        if (userIndex !== _userIndex) {
          applyUpdate(update, _userIndex);
        }
      });
    }
  });
}

users[0].text.insert(0, 'abc');
const update = users[0].shiftUpdate();
applyUpdate(update, 1);
applyUpdate(update, 2);
console.assert(textEqual());
logText(0);
users[0].text.format(0, 1, { bold: true });
users[1].text.format(1, 3, { bold: true });
users[2].text.format(1, 3, { bold: true });
logText(1);
logText(2);
const update2 = users[0].shiftUpdate();
applyUpdate(update2, 1);
applyUpdate(update2, 2);
logText(1);
logText(2);
console.log('User 1 cleanup: deleted (0, 4), (1, 0)');
console.log('User 2 cleanup: deleted (0, 4), (2, 0)');
syncAll();
console.assert(textEqual());
logText(0);
console.log('User 0:', users[0].text.toString());
console.log("Only delete item, not insert item, so it's fine");
