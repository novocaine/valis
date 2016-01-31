define(['app/vobjects/vobject', 'app/util'],
(vobject, util) => {
  class Cycle extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    constructor(frequency = 440) {
      super(frequency);
      this.frequency = frequency;
    }

    generateXmodResult(context, frequency) {
      const result = context.getBuffer();
      for (let i = 0; i < result.length; i++) {
        const radiansPerSample = frequency[i] * 2 * Math.PI / context.sampleRate;
        result[i] = Math.cos((context.sampleTime + i) * radiansPerSample);
      }
      return [result];
    }

    generateFixedFreqResult(context, frequency) {
      const radiansPerSample = (frequency * 2 * Math.PI) / context.sampleRate;
      const result = context.getBuffer();
      for (let i = 0; i < result.length; i++) {
        result[i] = Math.cos((context.sampleTime + i) * radiansPerSample);
      }
      return [result];
    }

    generate(context, inputs, outputs) {
      const frequency = 0 in inputs ? inputs[0] : this.frequency;

      if (util.isAudioArray(frequency)) {
        return this.generateXmodResult(context, frequency);
      }
      return this.generateFixedFreqResult(context, frequency);
    }
  }

  Cycle.vobjectClass = 'oscillator';
  Cycle.vobjectSymbol = 'osc';

  return Cycle;
});
