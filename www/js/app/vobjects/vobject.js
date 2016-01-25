define(['lodash'], (_) => {
  class VObject {
    constructor() {
      this.id = _.uniqueId();
    }

    numInputs() { throw new Error('abstract'); }
    numOutputs() { throw new Error('abstract'); }

    toJSON() {
      return {};
    }

    getState() {
      return {};
    }
  }

  return {
    VObject
  };
});
