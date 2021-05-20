/**
 * @since 2021-05-20
 * @author vivaxy
 */
export default class Authority {
  constructor(doc) {
    this.doc = doc;
    this.steps = [];
    this.stepClientIDs = [];
    this.onNewSteps = [];
  }

  receiveSteps(version, steps, clientID) {
    if (version !== this.steps.length) {
      return;
    }

    // Apply and accumulate new steps
    steps.forEach((step) => {
      this.doc = step.apply(this.doc).doc;
      this.steps.push(step);
      this.stepClientIDs.push(clientID);
    });
    // Signal listeners
    this.onNewSteps.forEach(function (f) {
      f();
    });
  }

  stepsSince(version) {
    return {
      steps: this.steps.slice(version),
      clientIDs: this.stepClientIDs.slice(version),
    };
  }
}
