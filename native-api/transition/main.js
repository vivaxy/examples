/**
 * @since 150119 09:43
 * @author vivaxy
 */
var demo = document.querySelector('.demo');
demo.addEventListener('webkitTransitionEnd', function(e){
  console.log('webkitTransitionEnd', e);
  demo.classList.toggle('to');
}, false);
//demo.addEventListener('transitionEnd', function(e){
//  console.log('transitionEnd', e);
//}, false);
demo.classList.add('to');
