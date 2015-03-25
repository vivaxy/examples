/**
 * @since 150122 21:08
 * @author vivaxy
 */
var log = document.querySelector('.console');
var vendors = ['webkit', 'moz', 'ms'];
var visibilityChangeEvent = 'visibilitychange';
for (var x = 0; x < vendors.length && document.hidden === undefined; ++x) {
  document.hidden = document[vendors[x] + 'Hidden'];
  visibilityChangeEvent = window[vendors[x] + 'visibilitychange'];
}
log.innerHTML += 'visibilityChangeEvent : ' + visibilityChangeEvent + '<br>';
document.addEventListener(visibilityChangeEvent, function (event) {
  console.log(event);
  if (!document.hidden) {
    log.innerHTML += 'shown at ' + moment().format('YYYY-MM-DD HH:mm:ss.SSS') + '<br>';
  } else {
    log.innerHTML += 'hidden at ' + moment().format('YYYY-MM-DD HH:mm:ss.SSS') + '<br>';
  }
});
