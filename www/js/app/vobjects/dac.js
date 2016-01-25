define(['app/vobjects/vobject', 'app/util', 'app/console'],
(vobject, util, vconsole) => {
  class DAC extends vobject.VObject {
    // strictly stereo, for now
    numInputs() { return 2; }
    numOutputs() { return 0; }

    generate(context, inputs, outputs) {
      /* copy additively into external output buffers */
      for (const i in inputs) {
        if (i >= context.extOutputBuffers.length) {
          continue;
        }

        const ib = inputs[i];
        if (!util.isAudioArray(ib)) {
          throw new Error(`input ${i} received non-audio: ` +
            `${(typeof ib).toString()}: ${ib.toString().slice(0, 100)}`);
        }

        const buffer = context.extOutputBuffers[i];

        if (buffer.length !== ib.length) {
          throw new Error('input buffer length !== channel data length');
        }

        for (let s = 0; s < ib.length; s++) {
          // adds, so if there are multiple sources writing to the buffer
          // the audio will be mixed together
          buffer[s] += ib[s];
        }
      }
    }
  }

  DAC.vobjectClass = 'dac~';

  return DAC;
});
