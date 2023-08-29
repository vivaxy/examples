/**
 * @since 2023-08-29
 * @author vivaxy
 */
console.log('location.href', location.href);
const redirect = document.getElementById('redirect');

redirect.addEventListener('click', function () {
  const url = new URL(location.href);
  const redirect = Number(url.searchParams.get('redirect')) || 0;
  url.searchParams.set('redirect', String(redirect + 1));
  location.href = url.href;
});
