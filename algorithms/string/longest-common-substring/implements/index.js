/**
 * @since 20180712 19:48
 * @author vivaxy
 */

module.exports = function longestCommonSubstring(s1, s2) {

  const matrix = [];

  let lcsLength = 0;
  let lcsI = 0;
  let lcsJ = 0;

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [];

    for (let j = 0; j <= s2.length; j++) {
      if (i === 0 || j === 0) {
        matrix[i][j] = 0;
      } else {

        if (s1[i - 1] === s2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = 0;
        }

        if (matrix[i][j] > lcsLength) {
          lcsLength = matrix[i][j];
          lcsI = i;
          lcsJ = j;
        }

      }
    }
  }

  if (lcsLength === 0) {
    return '';
  }

  return s1.slice(lcsI - lcsLength, lcsI);

  // let lcs = '';
  // while (matrix[lcsI][lcsJ] > 0) {
  //   lcs = s1[lcsI - 1] + lcs;
  //   lcsI--;
  //   lcsJ--;
  // }
  //
  // return lcs;
};
