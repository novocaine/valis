define(['app/vobjects/vobject'],
(vobject) => {
  class Cycle extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    constructor(frequency = 440) {
      super();
      this.frequency = frequency;
    }

    generate(context, inputs, outputs) {
      const frequency = 0 in inputs ? inputs[0] : this.frequency;
      const radiansPerSample = (frequency * 2 * Math.PI) / context.sampleRate;
      const result = context.getBuffer();
      for (let i = 0; i < result.length; i++) {
        result[i] = Math.cos((context.sampleTime + i) * radiansPerSample);
      }

      return [result];
    }
  }

  Cycle.vobjectClass = 'cycle~';

  return Cycle;
});
