/**
 * @since 2019-09-10 23:13:14
 * @author vivaxy
 */
const button = document.querySelector('button');
button.addEventListener('click', async function () {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Web Share',
        text: 'Web share demo page',
        url: location.href,
      });
      console.log('Successful share');
    } catch (e) {
      console.log('Error sharing', e);
    }
  }
});
