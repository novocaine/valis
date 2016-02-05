define(['lodash'], (_) => {
  class VObject {
    constructor(...args) {
      this.args = args;
    }

    numInputs() { throw new Error('abstract'); }
    numOutputs() { throw new Error('abstract'); }

    static processArgString(argString) {
      return _.map(argString.split(' '), (elem) => elem.trim());
    }
  }

  return {
    VObject
  };
});
