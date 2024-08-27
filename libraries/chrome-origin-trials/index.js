/**
 * @since 2024-08-27
 * @author vivaxy
 */
function isStandardZoom() {
  const div = document.createElement('div');
  div.style.width = '100px';
  div.style.height = '100px';
  div.style.zoom = 2;
  document.body.appendChild(div);
  const { width } = div.getBoundingClientRect();
  document.body.removeChild(div);
  return width === 200;
}

console.log('isStandardZoom', isStandardZoom());
