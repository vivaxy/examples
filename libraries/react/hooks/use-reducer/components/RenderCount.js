/**
 * @since 2019-07-29 12:38
 * @author vivaxy
 */
window.renderCount = 0;

export default function RenderCount() {
  window.renderCount++;
  return `render count: ${window.renderCount}`;
}
