/**
 * @since 2019-09-19 01:45
 * @author vivaxy
 */
performance.mark('javascript-execution-start');

const $markName = document.getElementById('mark-name');
const $mark = document.getElementById('mark');
const $readMark = document.getElementById('read-mark');
const $clearMarks = document.getElementById('clear-marks');
const $markList = document.getElementById('mark-list');
$mark.addEventListener('click', function () {
  performance.mark($markName.value);
  updateMeasureMarks();
});
$readMark.addEventListener('click', function () {
  outputEntries('mark', $markName.value, $markList);
});
$clearMarks.addEventListener('click', function () {
  performance.clearMarks($markName.value);
  updateMeasureMarks();
});

function outputEntries(type, filterName, $list) {
  const items = performance.getEntriesByType(type).filter(function (item) {
    return item.name === filterName;
  });
  $list.innerHTML = '';
  items.forEach(function (item) {
    const $item = document.createElement('div');
    $item.classList.add('entry-item');
    $item.innerHTML = `entryType: ${item.entryType}
     name: ${item.name}
startTime: ${item.startTime}
 duration: ${item.duration}`;
    $list.appendChild($item);
  });
}

const $measureName = document.getElementById('measure-name');
const $measureStart = document.getElementById('measure-start');
const $measureEnd = document.getElementById('measure-end');
const $measure = document.getElementById('measure');
const $readMeasure = document.getElementById('read-measure');
const $measureList = document.getElementById('measure-list');
const $clearMeasures = document.getElementById('clear-measures');

$measure.addEventListener('click', function () {
  try {
    performance.measure(
      $measureName.value,
      $measureStart.value,
      $measureEnd.value,
    );
  } catch (e) {
    console.error(e);
  }
});
$readMeasure.addEventListener('click', function () {
  outputEntries('measure', $measureName.value, $measureList);
});
$clearMeasures.addEventListener('click', function () {
  performance.clearMeasures($measureName.value);
});

function updateMeasureMarks() {
  $measureStart.innerHTML = '';
  $measureEnd.innerHTML = '';
  const navigationNames = [];
  for (let i in performance.timing) {
    if (i !== 'toJSON') {
      navigationNames.push(i);
    }
  }
  const timings = [
    {
      type: 'navigation',
      names: navigationNames,
    },
  ];
  [, /* 'first-input', 'paint' Cannot measure */ 'mark'].forEach(function (
    type,
  ) {
    const names = performance.getEntriesByType(type).map(function (entry) {
      return entry.name;
    });
    if (names.length) {
      timings.push({
        type,
        names,
      });
    }
  });
  let innerHTML = '';
  timings.forEach(function (timing) {
    const $optgroup = document.createElement('optgroup');
    timing.names.forEach(function (name) {
      const $option = document.createElement('option');
      $option.textContent = name;
      $option.value = name;
      $optgroup.appendChild($option);
    });
    innerHTML += `<optgroup label="${timing.type}">${$optgroup.innerHTML}</optgroup>`;
  });
  $measureStart.innerHTML = innerHTML;
  $measureEnd.innerHTML = innerHTML;
}

performance.mark('javascript-execution-end');
performance.measure(
  'javascript-execution-time',
  'javascript-execution-start',
  'javascript-execution-end',
);
updateMeasureMarks();
