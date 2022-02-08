/**
 * @since 2022-02-08
 * @author vivaxy
 */
const { Mapping } = require('prosemirror-transform');

exports.rebaseSteps = (doc, steps, over) => {
  // calculate stepsInfo
  const stepsInfo = [];
  const mapping = new Mapping();
  steps.forEach((step) => {
    stepsInfo.push({
      step,
      inverted: step.invert(doc),
    });
    doc = step.apply(doc).doc;
  });

  // revert steps
  for (let i = stepsInfo.length - 1; i >= 0; i--) {
    doc = stepsInfo[i].inverted.apply(doc).doc;
    mapping.appendMap(stepsInfo[i].inverted.getMap());
  }

  // add new steps
  for (let i = 0; i < over.length; i++) {
    doc = over[i].apply(doc).doc;
    mapping.appendMap(over[i].getMap());
  }

  // map over steps
  let mapFrom = stepsInfo.length;
  for (let i = 0; i < stepsInfo.length; i++) {
    const mapped = stepsInfo[i].step.map(mapping.slice(mapFrom));
    mapFrom--;

    if (mapped) {
      doc = mapped.apply(doc).doc;
      mapping.appendMap(mapped.getMap(), mapFrom);
    }
  }
  return doc;
};
