/**
 * @since 2020-05-22 15:43
 * @author vivaxy
 */
const $target = document.getElementById('target');
const $container = document.getElementById('container');
const $scroll = document.getElementById('scroll');
const $scrollAndScroll = document.getElementById('scroll-and-scroll');

function scroll() {
  $target.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

$scroll.addEventListener('click', scroll);

$scrollAndScroll.addEventListener('click', function () {
  scroll();
  function handleScroll() {
    document.getElementById('mask').scrollLeft = 0;
    document.removeEventListener('scroll', handleScroll);
  }
  document.addEventListener('scroll', handleScroll);
});
