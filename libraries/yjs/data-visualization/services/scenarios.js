/**
 * @since 2021-06-25
 * @author vivaxy
 */
import docEdit from '../steps/doc-edit.js';
import twoDocsSyncWithoutConflicts from '../steps/two-docs-sync-without-conflicts.js';
import twoDocsSyncWithConflicts from '../steps/two-docs-sync-with-conflicts.js';
import twoDocsSyncWithLostUpdate from '../steps/two-docs-sync-with-lost-update.js';

const SCENARIO_SEARCH_KEY = 'scenario';

function init(e) {
  const scenarios = {
    docEdit,
    twoDocsSyncWithoutConflicts,
    twoDocsSyncWithConflicts,
    twoDocsSyncWithLostUpdate,
  };

  const $scenarios = document.getElementById('scenarios');
  Object.keys(scenarios).forEach(function (scenario) {
    const $option = document.createElement('option');
    $option.textContent = scenario;
    $option.value = scenario;
    $scenarios.appendChild($option);
  });

  const url = new URL(location.href);
  const searchParams = url.searchParams;
  const currentScenario =
    searchParams.get(SCENARIO_SEARCH_KEY) || Object.keys(scenarios)[0];
  $scenarios.value = currentScenario;

  $scenarios.addEventListener('change', function () {
    searchParams.set(SCENARIO_SEARCH_KEY, $scenarios.value);
    location.href = url.href;
  });

  let curStepIndex = 0;
  const steps = scenarios[currentScenario];

  const $nextStep = document.getElementById('next-step');
  $nextStep.addEventListener('click', nextStep);

  function nextStep() {
    if (curStepIndex >= steps.length) {
      $nextStep.disabled = true;
      return false;
    }
    const step = steps[curStepIndex];
    e.emit(...step);
    curStepIndex++;
  }
}

export default { init };
