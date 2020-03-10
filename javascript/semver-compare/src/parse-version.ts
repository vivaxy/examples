/**
 * @since 2020-03-10 07:33
 * @author vivaxy
 */
enum SECION_INDEX {
  MAJOR = 0,
  MINOR = 1,
  PATCH = 2,
  PRERELEASE = 3,
  BUILD = 4,
}

export default function parseVersion(
  version: string,
): [number, number, number, string | false, string | false] {
  function createInvalidVersionError() {
    return new Error(`Invalid version (${version})`);
  }

  if (!version) {
    throw createInvalidVersionError();
  }

  let sectionIndex: SECION_INDEX = SECION_INDEX.MAJOR;
  const result: [number, number, number, string | false, string | false] = [
    0,
    0,
    0,
    false,
    false,
  ];
  let value = '';
  let i = 0;

  function toNumber() {
    const result = parseInt(value);
    if (isNaN(result)) {
      throw createInvalidVersionError();
    }
    value = '';
    return result;
  }

  function toString() {
    const result = value;
    if (!result) {
      throw createInvalidVersionError();
    }
    value = '';
    return result;
  }

  while (i < version.length) {
    const char = version[i];
    if (char === '.') {
      if (
        sectionIndex === SECION_INDEX.MAJOR ||
        sectionIndex === SECION_INDEX.MINOR
      ) {
        result[sectionIndex] = toNumber();
        sectionIndex++;
        if (i === version.length - 1) {
          throw createInvalidVersionError();
        }
      } else if (sectionIndex === SECION_INDEX.PATCH) {
        throw createInvalidVersionError();
      } else {
        value += char;
      }
    } else if (char === '-') {
      if (
        sectionIndex === SECION_INDEX.MAJOR ||
        sectionIndex === SECION_INDEX.MINOR ||
        sectionIndex === SECION_INDEX.PATCH
      ) {
        result[sectionIndex] = toNumber();
        sectionIndex = SECION_INDEX.PRERELEASE;
      } else {
        value += char;
      }
    } else if (char === '+') {
      if (
        sectionIndex === SECION_INDEX.MAJOR ||
        sectionIndex === SECION_INDEX.MINOR ||
        sectionIndex === SECION_INDEX.PATCH
      ) {
        result[sectionIndex] = toNumber();
        sectionIndex = SECION_INDEX.BUILD;
      } else if (sectionIndex === SECION_INDEX.PRERELEASE) {
        result[sectionIndex] = toString();
        sectionIndex = SECION_INDEX.BUILD;
      } else {
        throw createInvalidVersionError();
      }
    } else if (/[0-9]/.test(char)) {
      value += char;
    } else if (/[a-zA-Z-\.]/.test(char)) {
      if (sectionIndex < SECION_INDEX.PRERELEASE) {
        throw createInvalidVersionError();
      }
      value += char;
    } else {
      throw createInvalidVersionError();
    }
    i++;
  }
  if (
    sectionIndex === SECION_INDEX.MAJOR ||
    sectionIndex === SECION_INDEX.MINOR ||
    sectionIndex === SECION_INDEX.PATCH
  ) {
    result[sectionIndex] = toNumber();
  } else {
    result[sectionIndex] = toString();
  }
  return result;
}
