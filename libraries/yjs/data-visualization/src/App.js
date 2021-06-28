import { useState } from 'react';
import * as Y from 'yjs';

import Scenarios from './components/Scenarios';
import Doc from './components/Doc';
import scenarios from './scenarios';
import * as EDIT_TYPE from './enums/edit-types';
import * as Y_DOC_KEYS from './enums/y-doc-keys';
import * as E from './enums/event-types.js';
import * as ENUMS from './enums/enums';

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

  function setDocs(docs) {
    _setDocs(docs);
    window.docs = docs;
  }

  function updateDocById(id, updateDoc) {
    const newDocs = [
      ...docs.slice(0, id),
      updateDoc(docs[id]),
      ...docs.slice(id + 1),
    ];
    setDocs(newDocs);
  }

  function handleScenarioChange(scenario) {
    setCurrentScenario(scenario);
    setCurrentScenarioStepIndex(0);
    setDocs([]);
  }

  function handleNextStep() {
    setCurrentScenarioStepIndex(currentScenarioStepIndex + 1);
    const currentScenarioSteps = scenarios[currentScenario];
    const [action, payload] = currentScenarioSteps[currentScenarioStepIndex];
    switch (action) {
      case E.DOC_OPEN:
        handleOpenDoc();
        break;
      case E.DOC_UPDATE:
        handleEditorChange(payload);
        break;
      case E.DOC_SYNC:
        handleSync(payload);
        break;
      case E.DOC_CLOSE:
        handleCloseDoc(payload);
        break;
      default:
        throw new Error('Unexpected action: ' + action);
    }
  }

  function handleRestartStep() {
    setCurrentScenarioStepIndex(0);
    setDocs([]);
  }

  function handleOpenDoc() {
    const yDoc = new Y.Doc();
    setDocs([
      ...docs,
      {
        id: docs.length,
        yDoc: yDoc, // mutable
        updates: [], // { action, payload }
      },
    ]);
  }

  function handleCloseDoc(doc) {
    doc.yDoc.destroy();
    updateDocById(doc.id, function () {
      return null;
    });
  }

  function handleEditorChange(action) {
    const { id, type, pos, str, len } = action;
    updateDocById(id, function (doc) {
      const prevStateVector = Y.encodeStateVector(doc.yDoc);
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

      const update = Y.encodeStateAsUpdate(doc.yDoc, prevStateVector);

      return {
        ...doc,
        updates: [
          ...doc.updates,
          {
            action,
            payload: update,
          },
        ],
      };
    });
  }

  function handleSync({ from, to, index }) {
    updateDocById(from, function (doc) {
      if (!doc) {
        return;
      }
      const toDoc = docs[to];
      const updates = index === undefined ? doc.updates : [doc.updates[index]];
      updates.forEach(function (update) {
        Y.applyUpdate(toDoc.yDoc, update.payload);
      });
      return {
        ...doc,
        updates: doc.updates.filter(function (update) {
          return !updates.includes(update);
        }),
      };
    });
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
      <div className="docs-container">
        {docs.filter(Boolean).map(function (doc) {
          return (
            <Doc
              key={doc.id}
              doc={doc}
              docs={docs}
              editable={editable}
              onCloseDoc={handleCloseDoc}
              onEditorChange={handleEditorChange}
              onSync={handleSync}
            />
          );
        })}
      </div>
    </div>
  );
}
