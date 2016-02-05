define(['lodash', 'app/vobjects/vobject'], (_, vobject) => {
  class MtoF extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    constructor() {
      super();
      this._lastFreq = 0.0;
    }

    generate(context, inputs, outputs) {
      const result = context.getBuffer();
      let lastNoteTime = 0;

      if (inputs[0]) {
        inputs[0].forEach((msg) => {
          // msg should be the msg dict constructed by 'midi'.
          // TODO: not sure about polyphony?
          if (msg.type === 0x90) { // note on
            this._lastFreq = this.frequencyFromNoteNumber(msg.note);
            // The notes occured at an earlier sample time, so we need to move
            // them forward into this context's frame - add the current buffer
            // len to them. TODO - maybe it's necessary to delay even more?
            // this will cause jitter if the note occurred any earlier than the
            // previous buffer render period, which I suspect might be common
            // ..
            let sampleOffset = (msg.sampleTime + result.length) - context.sampleTime;
            if (sampleOffset < 0) {
              sampleOffset = 0;
            }
            console.log(`fill ${this._lastFreq} ${lastNoteTime} ${sampleOffset}`);
            result.fill(this._lastFreq, lastNoteTime, sampleOffset);
            lastNoteTime = sampleOffset;
          }
        });
        result.fill(this._lastFreq, lastNoteTime);
      }

      return [result];
    }

    frequencyFromNoteNumber(note) {
      return 440 * Math.pow(2, (note - 69) / 12);
    }
  }

  MtoF.vobjectClass = 'mtof';
  MtoF.vobjectSymbol = 'mtof';

  return MtoF;
});
