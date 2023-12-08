/**
 * @since 2023-12-08
 * @author vivaxy
 */
const $demoPopover = document.getElementById('demo-popover');
$demoPopover.addEventListener('beforetoggle', function (e) {
  console.log('beforetoggle', e);
});
$demoPopover.addEventListener('toggle', function (e) {
  console.log('toggle', e);
});
