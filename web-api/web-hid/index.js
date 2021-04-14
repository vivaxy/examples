/**
 * @since 2020-10-11 15:07
 * @author vivaxy
 */
const $connect = document.getElementById('connect');
$connect.addEventListener('click', async function () {
  const deviceFilter = { vendorId: 0x045e };
  const opts = { filters: [deviceFilter] };
  const devices = await navigator.hid.requestDevice(opts);
  console.log('devices', devices);
  const controller = devices[0];
  await controller.open();
  controller.addEventListener('inputreport', function (e) {
    console.log('inputreport', e);
  });
});
