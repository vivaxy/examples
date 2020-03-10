/**
 * @since 2020-03-10 04:56
 * @author vivaxy
 */
export default function semverCompare(a: string, b: string) {
  function parseVersion(str: string) {
    function createInvalidVersion() {
      return new Error(`Invalid version (${str})`);
    }
    const [major, minor, ...etc] = str.split('.');
    if (!major || !minor || !etc.length) {
      throw createInvalidVersion();
    }
    const [patch, prerelease] = etc.join('.').split('-');
    if (!patch) {
      throw createInvalidVersion();
    }
    if (patch.includes('.')) {
      throw createInvalidVersion();
    }
    return [parseInt(major), parseInt(minor), parseInt(patch), prerelease];
  }

  const va = parseVersion(a);
  const vb = parseVersion(b);

  for (let i = 0; i < va.length; i++) {
    if (i === 3) {
      if (va[i] === undefined && vb[i] === undefined) {
        return 0;
      }
      if (va[i] === undefined) {
        return -1;
      }
      if (vb[i] === undefined) {
        return 1;
      }
    }
    if (va[i] < vb[i]) {
      return 1;
    }
    if (va[i] > vb[i]) {
      return -1;
    }
  }
  return 0;
}
