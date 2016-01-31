define(['lodash'], (_) => {
  class VObject {
    constructor(...args) {
      this.id = _.uniqueId();
      this.args = args;
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
