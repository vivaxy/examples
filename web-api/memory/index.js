/**
 * @since 2023-03-28
 * @author vivaxy
 */
function logMemory() {
  const {
    jsHeapSizeLimit,
    totalJSHeapSize,
    usedJSHeapSize,
  } = performance.memory;
  console.log('memory', {
    jsHeapSizeLimit,
    totalJSHeapSize,
    usedJSHeapSize,
  });
}

logMemory();
const a = [];
for (let i = 0; i < 1e6; i++) {
  a.push(`string-${i}`);
}
logMemory();
