/**
 * @since 20180712 19:48
 * @author vivaxy
 */

function assembleLCS(s1, s2, matrix, i, j) {
  if (matrix[i][j] === 0) {
    return '';
  } else if (s1[i - 1] === s2[j - 1]) {
    return assembleLCS(s1, s2, matrix, i - 1, j - 1) + s1[i - 1];
  } else if (matrix[i][j - 1] > matrix[i - 1][j]) {
    return assembleLCS(s1, s2, matrix, i, j - 1);
  } else {
    return assembleLCS(s1, s2, matrix, i - 1, j);
  }
}

module.exports = function longestCommonSequence(s1, s2) {

  const matrix = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [];

    for (let j = 0; j <= s2.length; j++) {
      if (i === 0 || j === 0) {
        matrix[i][j] = 0;
      } else {

        if (s1[i - 1] === s2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = Math.max(matrix[i][j - 1], matrix[i - 1][j]);
        }

      }
    }
  }

  return assembleLCS(s1, s2, matrix, s1.length, s2.length);
};
