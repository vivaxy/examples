/**
 * @since 2019-03-13 12:50
 * @author vivaxy
 * @see https://www.youtube.com/watch?v=IpfZ8Nj3uiE
 */
(async() => {
  const options = {
    /**
     * @see http://www.linux-usb.org/usb.ids
     */
    filters: [{ vendorId: 0x2a45 }],
  };

  const device = await navigator.usb.requestDevice(options);
  console.log('device', device);

  await device.open();

  await device.selectConfiguration(0);
  await device.claimInterface(0);

  await device.transferOut(1, 0x1a);
  const response = await device.transferIn(2, 5);
  console.log('response', response);
})();
