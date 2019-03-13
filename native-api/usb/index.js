/**
 * @since 2019-03-13 12:50
 * @author vivaxy
 * @see https://www.youtube.com/watch?v=IpfZ8Nj3uiE
 */
(async() => {
  const options = {
    filters: [{ vendorId: 0x2a45 }],
  };

  const device = await navigator.usb.requestDevice(options);
  console.log('device', device);
})();
