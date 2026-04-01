/**
 * @since 2024-01-01
 * @author vivaxy
 */

function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}

function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = (left + right) >>> 1;
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

function runBenchmark(fn, arr, target, iterations) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn(arr, target);
  }
  return performance.now() - start;
}

function binarySearchWithSort(arr, target) {
  const sorted = arr.slice().sort((a, b) => a - b);
  return binarySearch(sorted, target);
}

const ITERATIONS = 10000;
const LIST_SIZES = [100, 1000, 10000, 100000, 1000000];

// Build UI
const label = document.createElement('label');
label.textContent = 'List size: ';

const select = document.createElement('select');
LIST_SIZES.forEach((size) => {
  const option = document.createElement('option');
  option.value = size;
  option.textContent = size.toLocaleString();
  if (size === 10000) {
    option.selected = true;
  }
  select.appendChild(option);
});

const sortedLabel = document.createElement('label');
sortedLabel.textContent = ' Sorted array: ';

const sortedCheckbox = document.createElement('input');
sortedCheckbox.type = 'checkbox';
sortedCheckbox.checked = true;
sortedCheckbox.title =
  'When enabled, test with a sorted array. When disabled, test with an unsorted array (binary search will sort first).';

const button = document.createElement('button');
button.textContent = 'Start benchmark!';

document.body.prepend(button);
document.body.prepend(sortedCheckbox);
document.body.prepend(sortedLabel);
document.body.prepend(select);
document.body.prepend(label);

button.addEventListener('click', function () {
  const listSize = Number(select.value);
  const isSorted = sortedCheckbox.checked;

  // Build array
  let arr;
  if (isSorted) {
    // Sorted array [0, 1, 2, ..., listSize - 1]
    arr = Array.from({ length: listSize }, (_, i) => i);
  } else {
    // Unsorted array: shuffle [0, 1, 2, ..., listSize - 1]
    arr = Array.from({ length: listSize }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // Pick a target near the end to stress linear search more
  const target = Math.floor(listSize * 0.9);

  console.log(
    `List size: ${listSize.toLocaleString()}, target: ${target.toLocaleString()}, iterations: ${ITERATIONS.toLocaleString()}, sorted: ${isSorted}`,
  );

  const linearTime = runBenchmark(linearSearch, arr, target, ITERATIONS);
  console.log(`Linear search: ${linearTime.toFixed(2)}ms`);

  if (isSorted) {
    const binaryTime = runBenchmark(binarySearch, arr, target, ITERATIONS);
    console.log(`Binary search: ${binaryTime.toFixed(2)}ms`);
    if (binaryTime > 0) {
      const ratio = (linearTime / binaryTime).toFixed(2);
      console.log(`Binary search is ${ratio}x faster than linear search`);
    }
  } else {
    const binaryTime = runBenchmark(
      binarySearchWithSort,
      arr,
      target,
      ITERATIONS,
    );
    console.log(`Binary search (sort + search): ${binaryTime.toFixed(2)}ms`);
    if (binaryTime > 0) {
      const ratio = (linearTime / binaryTime).toFixed(2);
      console.log(
        `Binary search (sort + search) is ${ratio}x faster than linear search`,
      );
    }
  }
});
