/**
 * @since 2022-06-10 11:53
 * @author vivaxy
 */
const nodeIds = ['a', 'b'];

const eventNames = [
  'pointerover',
  'pointerenter',
  'pointerdown',
  'pointermove',
  'pointerup',
  'pointercancel',
  'pointerout',
  'pointerleave',
  'gotpointercapture',
  'lostpointercapture',
];

let lastLog = '';

nodeIds.forEach(function (id) {
  const node = document.getElementById(id);
  eventNames.forEach(function (eventName) {
    node.addEventListener(eventName, function (e) {
      const log = `${e.target.id} ${e.type}`;
      if (lastLog === log) {
        return;
      }
      console.log(log);
      lastLog = log;
    });
  });
});
