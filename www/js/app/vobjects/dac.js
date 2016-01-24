define(["vobjects/vobject", "util", "console"],
function(vobject, util, vconsole) {
  class DAC extends vobject.VObject {
    // strictly stereo, for now
    numInputs() { return 2; }
    numOutputs() { return 0; }

    generate(context, inputs, outputs) {
      /* copy additively into external output buffers */
      for (var i in inputs) {
        if (i >= context.ext_output_buffers.length) {
          continue;
        }

        var ib = inputs[i];
        if (!util.is_audio_array(ib)) {
          throw new Error("input " + i + " received non-audio: " + 
            (typeof ib).toString() + ": " + ib.toString().slice(0, 100));
        }

        var buffer = context.ext_output_buffers[i];

        if (buffer.length !== ib.length) {
          throw new Error("input buffer length !== channel data length");
        }

        for (var s=0; s < ib.length; s++) {
          // adds, so if there are multiple sources writing to the buffer
          // the audio will be mixed together
          buffer[s] += ib[s];
        }
      }
    }
  }

  DAC.vobject_class = "dac~";

  return DAC;
});
