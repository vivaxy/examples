/**
 * @since 2024-01-22
 * @author vivaxy
 */
const fs = require('fs');

function createFunctionBody(index, functionLoopCount, skip) {
  return index === 0
    ? `return performance.now() - startTime;`
    : `let sum = 0;
  ${Array.from({ length: functionLoopCount }, (_, i) => {
    return `sum += ${i};`;
  }).join('\n')}
  return fun${Math.floor(index - (index % skip))}(startTime, sum);`;
}

function createArrowFunction(index, functionLoopCount, skip) {
  return `const fun${index + 1} = (startTime) => {
  ${createFunctionBody(index, functionLoopCount, skip)}
};\n`;
}

function createRegularFunction(index, functionLoopCount, skip) {
  return `function fun${index + 1}(startTime) {
  ${createFunctionBody(index, functionLoopCount, skip)}
}\n`;
}

function createIIFE(type, body) {
  if (type === 'arrow-function') {
    return `(() => {${body}})();`;
  }
  return `(function() {${body}})();`;
}

/**
 * @param {'arrowFunction' | 'regularFunction'} type
 * @param callDepth {number}
 * @param functionLoopCount {number}
 * @param outerLoopCount {number}
 * @param skip {number}
 * @return {string}
 */
function createFunction(
  type,
  callDepth,
  functionLoopCount,
  outerLoopCount,
  skip,
) {
  const createFunctionBody =
    type === 'arrowFunction' ? createArrowFunction : createRegularFunction;
  let result = `function fun0(startTime) {
  return performance.now() - startTime;
}\n`;
  let i = 0;
  for (; i < callDepth; i++) {
    result += createFunctionBody(i, functionLoopCount, skip);
  }
  result += `let costSum = 0;
for (let i = 0; i < ${outerLoopCount}; i++) {
  costSum += fun${i}(performance.now());
}
console.log('${type} cost', costSum)\n`;
  return createIIFE(type, result);
}

const callDepth = 1000;
const functionLoopCount = 1000;
const outerLoopCount = 1000;
const skip = 3;

fs.writeFileSync(
  'arrow-function.js',
  createFunction(
    'arrowFunction',
    callDepth,
    functionLoopCount,
    outerLoopCount,
    skip,
  ),
);
fs.writeFileSync(
  'regular-function.js',
  createFunction(
    'regularFunction',
    callDepth,
    functionLoopCount,
    outerLoopCount,
    skip,
  ),
);
