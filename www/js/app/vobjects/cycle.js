define(["vobjects/vobject", "vobjects/vobject_args"],
function(vobject, vobject_args) {
  class Cycle extends vobject.VObject {
    num_inputs() { return 1; }
    num_outputs() { return 1; }

    process_args(args) {
      var args = vobject_args.process_argmap({
        "frequency": {
          "default": 440
        }
      }, args);

      return args;
    }

    constructor(args) {
      super(args);
    }

    process(context) {
      if (!context.output_buffers[0]) {
        return;
      }

      var radians_per_sample = (this.args.frequency * 2 * Math.PI) / context.sample_rate;
      for (var i=0; i < context.output_buffers[0].length; i++) {
        context.output_buffers[0][i] = Math.cos(
          (context.sample_time + i) * radians_per_sample);
      }
    }
  }

  return {
    Cycle: Cycle
  }
});
