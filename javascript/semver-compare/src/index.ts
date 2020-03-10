/**
 * @since 2020-03-10 04:56
 * @author vivaxy
 */
import parseVersion from './parse-version';

function comparePrerelease(a: string | false, b: string | false) {
  // maybe `false`, `'xxx'`
  if (a === false) {
    if (b === false) {
      return 0;
    }
    return -1;
  }
  if (b === false) {
    return 1;
  }
  return a > b ? -1 : 1;
}

export default function semverCompare(a: string, b: string) {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  for (let i = 0; i < va.length; i++) {
    if (i === 3) {
      return comparePrerelease(va[i], vb[i]);
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
