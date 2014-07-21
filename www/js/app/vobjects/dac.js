define(["vobjects/vobject"],
function(vobject) {
  class DAC extends vobject.VObject {
    constructor(...args) {
      super(args);
    }

    // strictly stereo, for now
    num_inputs() { return 2; }
    num_outputs() { return 0; }

    process(context) {
      /* copy additively into external output buffers */
      for (var i in context.input_buffers) {
        if (i >= context.ext_output_buffers.length) {
          continue;
        }

        var channel_data = context.ext_output_buffers[i];
        if (context.input_buffers[i].length !== channel_data.length) {
          throw new Error("input buffer length " + context.input_buffers[i].length +
            " !== channel data length " + channel_data.length);
        }

        var ib = context.input_buffers[i];
        for (var s=0; s < ib.length; s++) {
          // adds, so if there are multiple sources writing to the buffer
          // the audio will be mixed together
          channel_data[s] += ib[s];
        }
      }
    }
  }

  return {
    DAC: DAC
  }
});
