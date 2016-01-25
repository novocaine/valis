define(['app/vobjects/vobject'],
(vobject) => {
  class Time extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    generate(context, inputs, outputs) {
      return [context.sampleTime];
    }
  }

  return Time;
});
