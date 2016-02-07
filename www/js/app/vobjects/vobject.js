define(['lodash'], (_) => {
  class VObject {
    constructor(options, ...args) {
      // options is an object passed through from the factory code that is
      // undertood by this superclass (currently only containing an id); args
      // is the list of args from the end-user
      this.args = args;
      this.id = options.id;

      if (this.id === undefined) {
        throw Error('Vobject ctor not passed id');
      }
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
