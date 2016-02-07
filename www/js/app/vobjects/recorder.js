define(['app/vobjects/vobject', 'lodash'],
(vobject, _) => {
  class Recorder extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 0; }

    constructor(options, args) {
      super(options, args);
      this.record = {};
    }

    generate(context, inputs, outputs) {
      this.record[context.sampleTime] =
        _.mapValues(inputs, (input) => input.toString());
      return [];
    }
  }

  return Recorder;
});
