/**
 * @since 2022-06-27 15:46
 * @author vivaxy
 */
const $target = document.getElementById('target');
$target.addEventListener('mouseenter', function (e) {
  console.log('mouseenter');
});
$target.addEventListener('mousemove', function (e) {
  console.log('mousemove');
});
$target.addEventListener('mouseleave', function (e) {
  console.log('mouseleave');
});
