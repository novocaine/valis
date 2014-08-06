define(["lib/lodash"], function(_) {
  "use strict";

  class VObject {
    constructor() {
      this.id = _.uniqueId();
    }

    process_args(args) {
      return {};
    }

    process(context) {
    }

    num_inputs() { throw new Error("abstract"); }
    num_outputs() { throw new Error("abstract"); }
  }

  return {
    VObject: VObject
  }
});
