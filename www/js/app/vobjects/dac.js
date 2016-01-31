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
        if (ib === null) {
          throw new Error(`input ${i} === null`);
        }

        if (!util.isAudioArray(ib)) {
          const type = `${(typeof ib).toString()}`;
          const str = ib ? `${ib.toString().slice(0, 100)}` : '';
          throw new Error(`input ${i} received non-audio: ${type}, ${str}`);
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

  DAC.vobjectClass = 'output';
  DAC.vobjectSymbol = '&#x1f50a;';

  return DAC;
});
