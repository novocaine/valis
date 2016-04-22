define(['app/vobjects/vobject', 'app/util', 'lodash'],
(vobject, util, _) => {
  class Cycle extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    constructor(options, frequency = 440) {
      super(options, frequency);
      this.frequency = parseFloat(frequency);
      this._prevx = 0.0;
      this._prevFrequency = 0.0;
    }

    generateXmodResult(result, context, frequency) {
      let x = this._prevx;
      for (let i = 0; i < result.length; i++) {
        const radiansPerSample = (frequency[i] * 2 * Math.PI) / context.sampleRate;
        x += radiansPerSample;
        result[i] = Math.cos(x);
      }
      this._prevx = x;
    }

    generateFixedFreqResult(result, context, frequency, from, until) {
      from = Math.min(Math.max(from, 0), result.length);
      until = Math.min(Math.max(until, 0), result.length);

      const radiansPerSample = (frequency * 2 * Math.PI) / context.sampleRate;
      if (until === undefined) {
        until = result.length;
      }
      for (let i = from; i < until; i++) {
        this._prevx += radiansPerSample;
        result[i] = Math.cos(this._prevx);
      }
    }

    generateMsgResult(result, context, messages) {
      this.generateFixedFreqResult(result, context, this._prevFrequency, 0,
        messages.length === 0 ? result.length :
          messages[0].sampleTime - context.sampleTime);

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        this.generateFixedFreqResult(result, context, msg.data,
          msg.sampleTime - context.sampleTime,
          i === messages.length - 1 ? result.length :
            messages[i + 1].sampleTime - context.sampleTime);
      }

      if (messages.length) {
        this._prevFrequency = messages[messages.length - 1].data;
      }
    }

    generate(context, inputs, outputs) {
      const frequency = 0 in inputs ? inputs[0] : this.frequency;
      const result = context.getBuffer();

      if (util.isAudioArray(frequency)) {
        this.generateXmodResult(result, context, frequency);
      } else if (_.isNumber(frequency)) {
        this.generateFixedFreqResult(result, context, frequency, 0, result.length);
      } else if (_.isArray(frequency)) {
        this.generateMsgResult(result, context, frequency);
      } else {
        throw Error(`unexpected input type`);
      }

      return [result];
    }
  }

  Cycle.vobjectClass = 'oscillator';
  Cycle.vobjectSymbol = 'osc';

  return Cycle;
});
