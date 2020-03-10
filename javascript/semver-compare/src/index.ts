/**
 * @since 2020-03-10 04:56
 * @author vivaxy
 */
export default function semverCompare(a: string, b: string) {
  function parseVersion(str: string) {
    function createInvalidVersion() {
      return new Error(`Invalid version (${str})`);
    }
    const [major = '0', minor = '0', ...etc] = str.split('.');
    if (!etc.length) {
      etc.push('0');
    }
    const [patch, prerelease] = etc.join('.').split('-');
    if (patch.includes('.')) {
      throw createInvalidVersion();
    }
    const versions = [parseInt(major), parseInt(minor), parseInt(patch)];
    if (versions.some(isNaN)) {
      throw createInvalidVersion();
    }
    return [...versions, prerelease];
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
