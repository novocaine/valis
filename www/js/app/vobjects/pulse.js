define(['lodash', 'app/vobjects/vobject', 'app/msg', 'app/util'],
(_, vobject, Message, util) => {
  class Pulse extends vobject.VObject {
    numInputs() { return 0; }
    numOutputs() { return 1; }

    constructor(bpm, pulseLength) {
      super(bpm, pulseLength);
      this.bpm = parseFloat(bpm); // in beats per minute
      this.pulseLength = parseFloat(pulseLength); // in beats
      this._nextMsgSampleTime = null;
      this._nextMessageData = 1;
    }

    generate(context, inputs, outputs) {
      const samplePeriod = util.bpmToPeriod(this.bpm, context.sampleRate);
      const sampleTimePulse = util.bpmToPeriod(this.bpm / this.pulseLength,
        context.sampleRate);
      const sampleTimeAfterPulse = Math.abs(samplePeriod - sampleTimePulse);
      const messages = [];

      let t = this._nextMsgSampleTime === null ?
        context.sampleTime : this._nextMsgSampleTime;

      // skip ticks if we have fallen behind - these can't be delivered late
      // as timing is too important
      const behindBy = context.sampleTime - t;
      if (behindBy > 0) {
        t += Math.ceil(behindBy / samplePeriod) * samplePeriod;
      }

      for (;
           t < context.sampleTime + context.bufferSize;
           t += this._nextMessageData ? sampleTimeAfterPulse : sampleTimePulse) {
        messages.push(new Message(t, this._nextMessageData));
        this._nextMessageData = this._nextMessageData ? 0 : 1;
      }

      this._nextMsgSampleTime = t;

      return [messages];
    }
  }

  Pulse.vobjectClass = 'pulse';
  Pulse.vobjectSymbol = 'pulse';

  return Pulse;
});
