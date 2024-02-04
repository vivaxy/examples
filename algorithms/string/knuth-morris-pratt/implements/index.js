/**
 * @since 20180906 11:34
 * @author vivaxy
 * O(n + m)
 */
/**
 * @param {string} text
 * @param {string} pattern
 * @returns {number}
 */
export function knuthMorrisPratt(text, pattern) {
  if (pattern.length === 0) {
    return 0;
  }

  let textIndex = 0;
  let patternIndex = 0;
  const patternTable = buildPatternTable(pattern);

  while (textIndex < text.length) {
    if (text[textIndex] === pattern[patternIndex]) {
      if (patternIndex === pattern.length - 1) {
        return textIndex - patternIndex;
      }
      textIndex++;
      patternIndex++;
    } else {
      if (patternIndex === 0) {
        textIndex++;
      } else {
        patternIndex = patternTable[patternIndex - 1];
      }
    }
  }

  return -1;
}

/**
 * @param {string} pattern
 * @returns {number[]}
 */
function buildPatternTable(pattern) {
  let patternTable = [0];
  let i = 1;
  let j = 0;

  while (i < pattern.length) {
    if (pattern[i] === pattern[j]) {
      patternTable[i] = j + 1;
      i++;
      j++;
    } else {
      if (j === 0) {
        patternTable[i] = 0;
        i++;
      } else {
        j = patternTable[j - 1];
      }
    }
  }

  return patternTable;
}
