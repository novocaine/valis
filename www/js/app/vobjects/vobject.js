define(['lodash'], (_) => {
  class VObject {
    constructor(...args) {
      this.args = args;
    }

    numInputs() { throw new Error('abstract'); }
    numOutputs() { throw new Error('abstract'); }

    static processArgString(argString) {
      if (argString.trim().length === 0) {
        return [];
      }
      return _.map(argString.split(' '), (elem) => elem.trim());
    }
  }

  return {
    VObject
  };
});
