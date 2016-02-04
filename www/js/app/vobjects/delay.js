define(['app/vobjects/vobject', 'app/util'],
(vobject, util) => {
  class Delay extends vobject.VObject {
    constructor(delay = 0.5) {
      super(delay);
      this.delay = delay;
      // circular buffer
      this._buf = null;
      this._ptr = null;
    }

    numInputs() { return 1; }
    numOutputs() { return 1; }

    generate(context, inputs, outputs) {
      if (inputs[0] === undefined) {
        return [];
      }

      if (!util.isAudioArray(inputs[0])) {
        throw Error('input must be audio');
      }

      const result = context.getBuffer();
      const delaySamples = this.delay * context.sampleRate;

      if (this._buf === null) {
        this._buf = util.allocBuffer(delaySamples);
      }

      // write output from buffer
      for (let i = 0; i < result.length && i < this._buf.length; i++) {
        result[i] = this._buf[this._ptr++ % this._buf.length];
      }

      let i = 0;

      // write input delayed directly to result (when delay < bufsize)
      for (let r = this._buf.length;
           i < inputs[0].length && r < result.length;
           i++, r++) {
        result[r] = inputs[0][i];
      }

      // fix up the ptr to avoid it getting crazy large eventually
      this._ptr = this._ptr % this._buf.length;

      if (delaySamples > this._buf.length) {
        // user increased the length of the delay, so reallocate it.
        // TODO: this discards the existing buffer entirely, which
        // still contains relevant data if delay was > bufsize
        this._buf = util.allocBuffer(delaySamples);
      }

      // write unwritten input overflow to the buffer
      for (let b = this._ptr - 1, j = inputs[0].length - 1; j >= i; j--, b--) {
        // % doesn't modulo correctly for negatives
        if (b < 0) {
          b = this._buf.length - 1;
        }
        this._buf[b] = inputs[0][j];
      }

      return [result];
    }
  }

  Delay.vobjectClass = 'delay';
  Delay.vobjectSymbol = 'del';

  return Delay;
});
