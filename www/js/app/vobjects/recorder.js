define(['vobjects/vobject', 'lodash'],
(vobject, _) => {
  class Recorder extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 0; }

    constructor(args) {
      super(args);
      this.record = {};
    }

    generate(context, inputs, outputs) {
      this.record[context.sample_time] =
        _.mapValues(inputs, (input) => input.toString());
      return [];
    }
  }

  return Recorder;
});
