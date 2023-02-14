/**
 * @since 2023-02-14 14:32
 * @author vivaxy
 */
function clamp(value, length) {
  const RADIX = 2;
  const binaryValue = value.toString(RADIX);
  return parseInt(binaryValue.slice(-length), RADIX);
}

let seq = 0;

export default function generateSnowFlakeId(epoch = 1288834974657) {
  const timestamp = clamp(Date.now() - epoch, 41);
  const machineId = clamp(Math.floor(Math.random() * 2 ** 10), 10);
  const sequenceNumber = clamp(seq++, 12);
  return (timestamp * 2 ** 10 + machineId) * 2 ** 12 + sequenceNumber;
}
