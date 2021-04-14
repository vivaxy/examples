/**
 * @since 2014/8/28 14:40
 * @author vivaxy
 */
if (localStorage.visited) {
  localStorage.visited = Number(localStorage.visited) + 1;
} else {
  localStorage.visited = 1;
}
var out = '';
for (var i = 0; i < localStorage.length; i++) {
  var key = localStorage.key(i);
  var value = localStorage.getItem(key);
  out = out + key + ' : ' + value + '<br >';
}
document.write(out);
