import { useState } from 'react';
import * as Y from 'yjs';

import Scenarios from './components/Scenarios';
import Doc from './components/Doc/index';
import Actions from './components/Actions/index';
import scenarios from './scenarios';
import * as EDIT_TYPE from './enums/edit-types';
import * as Y_DOC_KEYS from './enums/y-doc-keys';
import * as E from './enums/event-types.js';
import * as ENUMS from './enums/enums';
import { sleep } from './helpers';
import decodeUpdate from './update-decoder';
import decodeDeleteSet from './update-decoder/delete-set-decoder';
import ViewOptions from './components/ViewOptions';
import * as VIEW_OPTIONS from './enums/view-options';

import './App.css';

const SCENARIO_QUERY_KEY = 'scenario';

function getURLQuery(key) {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  return searchParams.get(key);
}

export default function App() {
  // url like ?scenario=TwoDocsSyncWithoutConflicts
  const [currentScenario, setCurrentScenario] = useState(
    getURLQuery(SCENARIO_QUERY_KEY) || ENUMS.CUSTOM_SCENARIO,
  );
  const [currentScenarioStepIndex, setCurrentScenarioStepIndex] = useState(0);
  const [docs, _setDocs] = useState([]);
  const [actionOptions, setActionActionOptions] = useState({
    gc: false,
    pud: false,
  });
  const [viewOptions, setViewOptions] = useState({
    dataSource: VIEW_OPTIONS.DATA_SOURCES.SHARE,
  });
  const [focusedDocId, setFocusedDocId] = useState(null);

  function setDocs(docs) {
    _setDocs(docs);
    window.docs = docs;
  }

  async function updateDocById(id, updateDoc) {
    const newDocs = [
      ...docs.slice(0, id),
      await updateDoc(docs[id]),
      ...docs.slice(id + 1),
    ];
    setDocs(newDocs);
  }

  function handleScenarioChange(scenario) {
    setCurrentScenario(scenario);
    setCurrentScenarioStepIndex(0);
    setDocs([]);
  }

  async function handleNextStep() {
    setCurrentScenarioStepIndex(currentScenarioStepIndex + 1);
    const currentScenarioSteps = scenarios[currentScenario];
    const [action, payload] = currentScenarioSteps[currentScenarioStepIndex];
    switch (action) {
      case E.DOC_OPEN:
        await handleOpenDoc();
        break;
      case E.DOC_UPDATE:
        await handleEditorChange(payload);
        break;
      case E.DOC_SYNC:
        await handleSync(payload);
        break;
      case E.DOC_CLOSE:
        await handleCloseDoc(payload);
        break;
      default:
        throw new Error('Unexpected action: ' + action);
    }
  }

  function handleRestartStep() {
    setCurrentScenarioStepIndex(0);
    setDocs([]);
  }

  async function handleOpenDoc() {
    const yDoc = new Y.Doc();
    yDoc.gc = actionOptions.gc;
    const id = docs.length;

    // when create doc, sync from the first doc
    const validDocs = docs.filter(Boolean);
    if (validDocs.length && id !== validDocs[0].id) {
      Y.applyUpdate(yDoc, Y.encodeStateAsUpdate(validDocs[0].yDoc));
    }

    // applyUpdate should occur before pud
    let pud = null;
    if (actionOptions.pud) {
      pud = new Y.PermanentUserData(yDoc);
      /**
       * cannot put setUserMapping and applyUpdate in one transaction
       * setUserMapping comes from local but applyUpdate comes from remote
       */
      pud.setUserMapping(yDoc, yDoc.clientID, `Doc${id}`);
      // setUserMapping use setTimeout to update pud
      await sleep(0);
    }

    // sync to other docs
    const update = Y.encodeStateAsUpdate(yDoc);
    validDocs.forEach(function (doc) {
      Y.applyUpdate(doc.yDoc, update);
    });
    setDocs([
      ...docs,
      {
        id,
        yDoc, // mutable
        pud,
        updates: [], // { action, payload }
      },
    ]);
  }

  async function handleCloseDoc(doc) {
    doc.yDoc.destroy();
    await updateDocById(doc.id, function () {
      return null;
    });
  }

  async function handleEditorChange(change) {
    const { id, actions } = change;
    await updateDocById(id, async function (doc) {
      let newUpdates = [];
      const prevStateVector = Y.encodeStateVector(doc.yDoc);
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const { type, pos, str, len } = action;
        const yText = doc.yDoc.getText(Y_DOC_KEYS.TEXT_KEY);
        switch (type) {
          case EDIT_TYPE.INSERT:
            yText.insert(pos, str);
            break;
          case EDIT_TYPE.DELETE:
            yText.delete(pos, len);
            break;
          default:
            throw new Error('Unexpected type');
        }
        await sleep(0);
        const update = Y.encodeStateAsUpdate(doc.yDoc, prevStateVector);
        const rawDecodedUpdate = decodeUpdate(update);
        const decodedUpdate = {
          items: rawDecodedUpdate.clientsStructs[doc.yDoc.clientID] || [],
          deleteSet:
            rawDecodedUpdate.deleteSet.clients[doc.yDoc.clientID] || [],
        };
        decodedUpdate.items.forEach(function (item) {
          if (item.type === 'binary') {
            const deleteSet = decodeDeleteSet(item.content);
            if (Object.keys(deleteSet).length) {
              item.decodedContent = deleteSet;
            }
            item.content = '[...]';
          }
        });
        console.log('update', decodedUpdate);
        newUpdates.push({
          action,
          payload: update,
          syncedIds: [id],
        });
      }
      if (docs.length === 1) {
        // do not record updates when there is only one doc.
        return doc;
      }
      return {
        ...doc,
        updates: [...doc.updates, ...newUpdates],
      };
    });
  }

  async function handleSync({ from, to, index }) {
    await updateDocById(from, function (doc) {
      if (!doc) {
        return;
      }
      const toDoc = docs[to];
      const toSyncUpdates =
        index === undefined ? doc.updates : [doc.updates[index]];
      toSyncUpdates.forEach(function (update) {
        Y.applyUpdate(toDoc.yDoc, update.payload);
      });
      return {
        ...doc,
        updates: doc.updates
          .map(function (update) {
            if (toSyncUpdates.includes(update)) {
              if (update.syncedIds.includes(to)) {
                return update;
              }
              return {
                ...update,
                syncedIds: [...update.syncedIds, to],
              };
            }
            return update;
          })
          .filter(function (update) {
            return update.syncedIds.length !== docs.filter(Boolean).length;
          }),
      };
    });
  }

  function handleActionOptionChange(changedOption) {
    setActionActionOptions({
      ...actionOptions,
      ...changedOption,
    });
  }

  function handleViewOptionChange(changedOption) {
    setViewOptions({
      ...viewOptions,
      ...changedOption,
    });
  }

  function getDocByClientId(clientID) {
    return docs.find(function (doc) {
      return doc.yDoc.clientID === clientID;
    });
  }

  function getHandleDocFocus(doc) {
    return function handleDocFocus() {
      setFocusedDocId(doc.id);
    };
  }

  const editable = currentScenario === ENUMS.CUSTOM_SCENARIO;

  return (
    <div className="App">
      <Scenarios
        scenarios={scenarios}
        currentScenario={currentScenario}
        currentScenarioStepIndex={currentScenarioStepIndex}
        onScenarioChange={handleScenarioChange}
        onNextStep={handleNextStep}
        onRestartStep={handleRestartStep}
        onOpenDoc={handleOpenDoc}
      />
      {!scenarios[currentScenario] && (
        <Actions
          onOpenDoc={handleOpenDoc}
          options={actionOptions}
          onOptionChange={handleActionOptionChange}
        />
      )}
      <ViewOptions
        options={viewOptions}
        onOptionChange={handleViewOptionChange}
      />
      <div className="docs-container">
        {docs.filter(Boolean).map(function (doc) {
          return (
            <Doc
              key={doc.id}
              doc={doc}
              docs={docs}
              editable={editable}
              dataSource={viewOptions.dataSource}
              onCloseDoc={handleCloseDoc}
              onEditorChange={handleEditorChange}
              onSync={handleSync}
              getDocByClientId={getDocByClientId}
              onFocus={getHandleDocFocus(doc)}
              focusedDocId={focusedDocId}
            />
          );
        })}
      </div>
    </div>
  );
}
