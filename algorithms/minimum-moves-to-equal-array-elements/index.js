/**
 * @since 2017-03-21 12:12:17
 * @author vivaxy
 * @see https://leetcode.com/problems/minimum-moves-to-equal-array-elements/

 Given a non-empty integer array of size n, find the minimum number of moves required to make all array elements equal, where a move is incrementing n - 1 elements by 1.

 Example:

 Input:
 [1,2,3]

 Output:
 3

 Explanation:
 Only three moves are needed (remember each move increments two elements):

 [1,2,3]  =>  [2,3,3]  =>  [3,4,3]  =>  [4,4,4]

 */

/**
 * 相当于：每次把其中一个值 -1，多少次后能让所有数字都一致？
 * @see https://leetcode.com/submissions/detail/97473501/
 * @param {number[]} nums
 * @return {number}
 */
var minMoves = function(nums) {
    var min = Math.min.apply(Math, nums);
    return nums.reduce(function(acc, num) {
        return acc + (num - min);
    }, 0);
};

console.log(minMoves([1, 2, 3]) === 3);
