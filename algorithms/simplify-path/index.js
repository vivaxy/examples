/**
 * @since 2017-03-20 08:53:17
 * @author vivaxy
 * @see https://leetcode.com/problems/simplify-path/
 */

/**
 * @see https://leetcode.com/submissions/detail/97327909/
 * @param {string} path
 * @return {string}
 */
var simplifyPath = function(path) {
    var sections = path.split('/');
    var current = [];
    sections.forEach(function(section) {
        switch (section) {
            case '':
                break;
            case '.':
                break;
            case '..':
                current.pop();
                break;
            default:
                current.push(section);
                break;
        }
    });
    return '/' + current.join('/');
};

console.log(simplifyPath('/home/') === '/home');
console.log(simplifyPath('/a/./b/../../c/') === '/c');
