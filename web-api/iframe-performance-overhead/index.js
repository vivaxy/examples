/**
 * @since 2022-12-20 20:16
 * @author vivaxy
 */
const root = document.getElementById('root');
for (let i = 0; i < 20; i++) {
  const iframe = document.createElement('iframe');
  iframe.src = '//localhost:3457/iframe.html';
  root.appendChild(iframe);
}
