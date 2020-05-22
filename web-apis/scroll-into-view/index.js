/**
 * @since 2020-05-22 15:43
 * @author vivaxy
 */
document.body.addEventListener('click', function() {
  const target = document.getElementById('target');
  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
});
