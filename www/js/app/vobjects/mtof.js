define(['lodash', 'app/vobjects/vobject'], (_, vobject) => {
  class MtoF extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    constructor() {
      super();
      this._lastFreq = 0.0;
    }

    generate(context, inputs, outputs) {
      if (inputs[0]) {
        inputs[0].forEach((msg) => {
          // msg should be the msg dict constructed by 'midi'.
          // TODO this is a bit sketchy and permissive, and note sure it's quite
          // right for polyphony in all cases
          if (msg.type === 0x90) { // note on
            this._lastFreq = this.frequencyFromNoteNumber(msg.note);
          }
        });
      }

      return [this._lastFreq];
    }

    frequencyFromNoteNumber(note) {
      return 440 * Math.pow(2, (note - 69) / 12);
    }
  }

  MtoF.vobjectClass = 'mtof';
  MtoF.vobjectSymbol = 'mtof;';

  return MtoF;
});
