/**
 * @since 2019-03-13 12:50
 * @author vivaxy
 * @see https://www.youtube.com/watch?v=IpfZ8Nj3uiE
 */

const requestDeviceButton = document.querySelector('.js-request-device');
const urlSearchParams = new URL(location.href).searchParams;
const vendorId = Number(urlSearchParams.get('vendorId')) || 0x2a45;
const configurationNumber = Number(urlSearchParams.get('configurationNumber')) || 1;
const interfaceNumber = Number(urlSearchParams.get('interfaceNumber')) || 0;

requestDeviceButton.addEventListener('click', async() => {
  try {
    const options = {
      /**
       * @see http://www.linux-usb.org/usb.ids
       */
      filters: [{ vendorId }],
    };

    const device = await navigator.usb.requestDevice(options);
    console.log('device', device);

    await device.open();

    await device.selectConfiguration(configurationNumber);
    await device.claimInterface(interfaceNumber);

    await device.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 0x22,
      value: 0x01,
      index: 0x02,
    });
    const response = await device.transferIn(5, 64);
    console.log('response', response);
  } catch (exception) {
    console.log('exception.code', exception.code, 'exception.name', exception.name, 'exception.message', exception.message);
  }
});
