/**
 * @since 2024-08-27
 * @author vivaxy
 */
function isStandardZoom() {
  const div = document.createElement('div');
  div.style.width = '100px';
  div.style.height = '100px';
  // @ts-expect-error zoom is not standard
  div.style.zoom = 2;
  document.body.appendChild(div);
  const { width } = div.getBoundingClientRect();
  document.body.removeChild(div);
  return width === 200;
}

/**
 * @param {string} token
 */
function addMeta(token) {
  const otMeta = document.createElement('meta');
  otMeta.httpEquiv = 'origin-trial';
  otMeta.content = token;
  document.head.append(otMeta);
}

if (location.origin === 'http://127.0.0.1:4000') {
  addMeta(
    'A85MwDbg6L0m4ydYXMz5OLnRO7XTdDcmV6qF2w47MPJYXZSCgBl4aGpnPdrhVAz8B2DInwxzJrYjuBbczRxHrAIAAAB1eyJvcmlnaW4iOiJodHRwOi8vMTI3LjAuMC4xOjQwMDAiLCJmZWF0dXJlIjoiRGlzYWJsZVN0YW5kYXJkaXplZEJyb3dzZXJab29tIiwiZXhwaXJ5IjoxNzQ0NzYxNTk5LCJpc1RoaXJkUGFydHkiOnRydWV9',
  );
} else if (
  location.host.endsWith('.github.io') &&
  location.protocol === 'https:'
) {
  addMeta(
    'A1yakgHmcsGUtydoyB8l+vPYLZO8vElWMv41LwQmJ3OmFX49LfnegIKXH7sd55SCw9Wf6u89EODlECE2YOSQ2w4AAACIeyJvcmlnaW4iOiJodHRwczovL2dpdGh1Yi5pbzo0NDMiLCJmZWF0dXJlIjoiRGlzYWJsZVN0YW5kYXJkaXplZEJyb3dzZXJab29tIiwiZXhwaXJ5IjoxNzQ0NzYxNTk5LCJpc1N1YmRvbWFpbiI6dHJ1ZSwiaXNUaGlyZFBhcnR5Ijp0cnVlfQ==',
  );
}
console.log('isStandardZoom', isStandardZoom());
