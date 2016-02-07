define(['lodash', 'app/vobjects/vobject'], (_, vobject) => {
  class ADSREnvelope extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    constructor(options, attack = 1, decay = 1, sustain = 0, release = 1) {
      super(options, attack, decay, sustain, release);
      this.attack = Math.max(0.01, parseFloat(attack));
      this.decay = Math.max(0.01, parseFloat(decay));
      this.sustain = parseFloat(sustain);
      this.release = Math.max(0.01, parseFloat(release));
      this._triggerOn = null;
      this._triggerOff = null;
      this._ptr = 0;
      this._lastOutput = 0;
      this._outputAtTriggerOff = 0;
      this._outputAtTriggerOn = 0;
    }

    genEnvelope(context, result, triggerOn, until, ptr) {
      const attackSampleTime = this.attack * context.sampleRate;
      const attackGradient = (1.0 - this._outputAtTriggerOn) / attackSampleTime;
      const decaySampleTime = this.decay * context.sampleRate;
      const decayGradient = (-1.0 + this.sustain) / decaySampleTime;
      const decaySampleEnd = decaySampleTime + attackSampleTime;

      // attack phase
      let r = triggerOn - context.sampleTime;
      if (r < 0) {
        r = 0;
      }
      for (;
          ptr < attackSampleTime && r < result.length
            && (r + context.sampleTime) < until;
          r++, ptr++) {
        this._lastOutput += attackGradient;
        result[r] = this._lastOutput;
      }

      // decay phase
      for (;
          ptr < decaySampleEnd && r < result.length
            && (r + context.sampleTime) < until;
          r++, ptr++) {
        this._lastOutput += decayGradient;
        result[r] = this._lastOutput;
      }

      // sustain phase
      for (;
          r < result.length && (r + context.sampleTime) < until;
          r++) {
        this._lastOutput = result[r] = this.sustain;
      }

      return ptr;
    }

    genReleaseEnvelope(context, result, triggerOff, until, ptr) {
      const releaseSampleTime = this.release * context.sampleRate;
      const releaseGradient = -this._outputAtTriggerOff / releaseSampleTime;

      let r = triggerOff - context.sampleTime;
      if (r < 0) {
        r = 0;
      }
      for (;
          ptr < releaseSampleTime && r < result.length
            && (r + context.sampleTime) < until;
          r++, ptr++) {
        this._lastOutput += releaseGradient;
        result[r] = this._lastOutput;
      }

      if (ptr >= releaseSampleTime) {
        this._triggerOff = null;
      }

      return ptr;
    }

    generate(context, inputs, outputs) {
      if (!inputs[0]) {
        return [];
      }
      const result = context.getBuffer();

      // finish playing envelope from messages in previous generates
      const untilPrev = inputs[0].length ? inputs[0][0].sampleTime : Number.MAX_VALUE;
      if (this._triggerOn) {
        this._ptr = this.genEnvelope(context, result, this._triggerOn, untilPrev,
          this._ptr);
      } else if (this._triggerOff) {
        this._ptr = this.genReleaseEnvelope(context, result, this._triggerOff, untilPrev,
          this._ptr);
      }

      for (let i = 0; i < inputs[0].length; i++) {
        const message = inputs[0][i];

        // limit the playback of the envelope until next message
        const until = (i === inputs[0].length - 1 ? Number.MAX_VALUE :
          inputs[0][i + 1].sampleTime);

        if (message.data) {
          // gate on
          this._triggerOn = message.sampleTime;
          this._outputAtTriggerOn = this._lastOutput;
          this._ptr = 0;
          this._triggerOff = null;
          this._ptr = this.genEnvelope(context, result, this._triggerOn, until,
            this._ptr);
          // TODO: disabling this puts the envelope into 'legato' mode, which
          // isn't always what you want - but enabling causes pops which need
          // to be ramped out
          // this._lastOutput = this._lastOutput;
        } else {
          // gate off
          this._ptr = 0;
          this._triggerOn = null;
          this._triggerOff = message.sampleTime;
          this._outputAtTriggerOff = this._lastOutput;
          this._ptr = this.genReleaseEnvelope(context, result, this._triggerOff, until,
            this._ptr);
        }
      }

      return [result];
    }
  }

  ADSREnvelope.vobjectClass = 'adsr';
  ADSREnvelope.vobjectSymbol = 'adsr';

  return ADSREnvelope;
});
