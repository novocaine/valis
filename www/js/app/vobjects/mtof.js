define(['lodash', 'app/vobjects/vobject', 'app/msg'], (_, vobject, Message) => {
  class MtoF extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 2; }

    constructor(options) {
      super(options);
      this._lastFreq = 0.0;
      this._notesOn = 0;
    }

    generate(context, inputs, outputs) {
      const result = context.getBuffer();
      const gateMsgs = [];
      let lastNoteTime = 0;

      if (inputs[0]) {
        inputs[0].forEach((msg) => {
          // msg is expected to be the format created by 'midi'.
          if (msg.data.type === 0x90) { // note on
            this._lastFreq = this.frequencyFromNoteNumber(msg.data.note);
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
            result.fill(this._lastFreq, lastNoteTime, sampleOffset);
            lastNoteTime = sampleOffset;
            gateMsgs.push(new Message(msg.sampleTime + result.length, 1));
            this._notesOn++;
          } else if (msg.data.type === 0x80) {
            // don't release the gate while we've still got notes on
            if (--this._notesOn === 0) {
              gateMsgs.push(new Message(msg.sampleTime + result.length, 0));
            }
          }
        });
        result.fill(this._lastFreq, lastNoteTime);
      }

      return [result, gateMsgs];
    }

    frequencyFromNoteNumber(note) {
      return 440 * Math.pow(2, (note - 69) / 12);
    }
  }

  MtoF.vobjectClass = 'mtof';
  MtoF.vobjectSymbol = 'mtof';

  return MtoF;
});
