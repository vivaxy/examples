/**
 * @since 2022-06-27 15:46
 * @author vivaxy
 */
const $target = document.getElementById('target');
$target.addEventListener('mouseenter', function (e) {
  console.log('target mouseenter');
});
// $target.addEventListener('mousemove', function (e) {
//   console.log('target mousemove');
// });
$target.addEventListener('mouseleave', function (e) {
  console.log('target mouseleave');
});

const $mask = document.getElementById('mask');
$mask.addEventListener('mouseenter', function (e) {
  console.log('mask mouseenter');
});
$mask.addEventListener('mouseleave', function (e) {
  console.log('mask mouseleave');
});

const $scroll = document.getElementById('scroll');
function handleMouseMove() {
  console.log('mousemove');
}
$scroll.addEventListener('mousedown', function () {
  console.log('moousedown');
  $scroll.addEventListener('mousemove', handleMouseMove);
});

$scroll.addEventListener('mouseup', function () {
  console.log('mouseup');
  $scroll.removeEventListener('mousemove', handleMouseMove);
});
