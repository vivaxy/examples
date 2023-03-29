/**
 * @since 2023-03-28
 * @author vivaxy
 */
async function measure() {
  const startTime = Date.now();
  console.log('Measure start.');
  if (!window.crossOriginIsolated) {
    console.log(
      'performance.measureUserAgentSpecificMemory() is only available in cross-origin-isolated pages',
    );
  } else if (!performance.measureUserAgentSpecificMemory) {
    console.log(
      'performance.measureUserAgentSpecificMemory() is not available in this browser',
    );
  } else {
    let result;
    try {
      result = await performance.measureUserAgentSpecificMemory();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'SecurityError') {
        console.log('The context is not secure.');
      } else {
        throw error;
      }
    }
    console.log(result);
  }
  console.log(`Measure done. Cost ${Date.now() - startTime}ms`);
}

const memory = [];

function useMemory() {
  console.log('useMemory start.');
  for (let i = 0; i < 1e7; i++) {
    memory.push(`String-${i}`);
  }
  console.log('useMemory done.');
}

document.querySelector('#measure').addEventListener('click', measure);
document.querySelector('#use-memory').addEventListener('click', useMemory);
