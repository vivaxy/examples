import { useState } from 'react';
import * as Y from 'yjs';

import Scenarios from './components/Scenarios';
import Actions from './components/Actions';
import Doc from './components/Doc';
import scenarios from './scenarios';
import * as EDIT_TYPE from './enums/edit-types';
import * as Y_DOC_KEYS from './enums/y-doc-keys';

import './App.css';

export default function App() {
  const [currentScenario, setCurrentScenario] = useState(
    Object.keys(scenarios)[0],
  );
  const [currentScenarioStepIndex, setCurrentScenarioStepIndex] = useState(0);
  const [docs, setDocs] = useState([]);

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
  }

  function handleNextStep() {
    const currentScenarioSteps = scenarios[currentScenario];
    if (currentScenarioStepIndex < currentScenarioSteps.length) {
      setCurrentScenarioStepIndex(currentScenarioStepIndex + 1);
    } else {
      setCurrentScenarioStepIndex(0);
    }
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

  function handleSync({ fromDocId, toDocId, update }) {
    updateDocById(fromDocId, function (doc) {
      const toDoc = docs[toDocId];
      Y.applyUpdate(toDoc.yDoc, update.payload);
      return {
        ...doc,
        updates: doc.updates.filter(function (_update) {
          return _update !== update;
        }),
      };
    });
  }

  const currentScenarioSteps = scenarios[currentScenario];
  const hasNextStep = currentScenarioStepIndex < currentScenarioSteps.length;

  return (
    <div className="App">
      <Scenarios
        scenarios={scenarios}
        currentScenario={currentScenario}
        onScenarioChange={handleScenarioChange}
        hasNextStep={hasNextStep}
        onNextStep={handleNextStep}
      />
      <Actions onOpenDoc={handleOpenDoc} />
      <div className="docs-container">
        {docs.filter(Boolean).map(function (doc) {
          return (
            <Doc
              key={doc.id}
              doc={doc}
              docs={docs}
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
