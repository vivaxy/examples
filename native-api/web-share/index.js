/**
 * @since 2019-09-10 23:13:14
 * @author vivaxy
 */
const button = document.querySelector('button');
button.addEventListener('click', function() {
  if (navigator.share) {
    navigator
      .share({
        title: 'Web Share',
        text: 'Web share demo page',
        url: location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
  }
});
