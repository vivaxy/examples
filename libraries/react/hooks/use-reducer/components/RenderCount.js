window.renderCount = 0;

export default function RenderCount() {
  window.renderCount++;
  return `render count: ${window.renderCount}`;
}
