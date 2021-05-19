/**
 * @since 2021-05-19
 * @author vivaxy
 */
export default class Authority {
  constructor(doc) {
    this.doc = doc;
    this.steps = [];
    this.stepClientIDs = [];
  }

  get version() {
    return this.steps.length;
  }

  receiveSteps(version, steps, clientID) {
    if (version !== this.version) {
      return false;
    }

    // Apply and accumulate new steps
    steps.forEach((step) => {
      this.doc = step.apply(this.doc).doc;
      this.steps.push(step);
      this.stepClientIDs.push(clientID);
    });
    return true;
  }

  stepsSince(version) {
    return {
      steps: this.steps.slice(version),
      clientIDs: this.stepClientIDs.slice(version),
    };
  }
}
