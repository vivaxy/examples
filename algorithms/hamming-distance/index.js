/**
 * @since 2017-03-09 12:24
 * @author vivaxy
 * @see https://leetcode.com/problems/hamming-distance/
 * @see https://leetcode.com/submissions/detail/96029999/
 */

/**
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
var hammingDistance = function(x, y) {
    var xbits = x.toString(2);
    var ybits = y.toString(2);
    var longer = x > y ? xbits : ybits;
    var shorter = x > y ? ybits : xbits;
    var longerBits = longer.split('').reverse();
    var shorterBits = shorter.split('').reverse();
    var count = 0;
    longerBits.forEach(function(lbit, index) {
        var sbit = shorterBits[index] || '0';
        if (sbit !== lbit) {
            count++;
        }
    });
    return count;
};

console.log(hammingDistance(1, 4) === 2);
