/**
 * @since 2023-03-28
 * @author vivaxy
 */
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
    const startTime = Date.now();
    result = await performance.measureUserAgentSpecificMemory();
    console.log(`Cost ${Date.now() - startTime}ms`);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'SecurityError') {
      console.log('The context is not secure.');
    } else {
      throw error;
    }
  }
  console.log(result);
}
