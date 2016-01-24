define(["lib/lodash"], function(_) {
  "use strict";

  class VObject {
    constructor() {
      this.id = _.uniqueId();
    }

    num_inputs() { throw new Error("abstract"); }
    num_outputs() { throw new Error("abstract"); }

    toJSON() {
      return {};
    }

    getState() {
      return {};
    }
  }

  return {
    VObject: VObject
  }
});
