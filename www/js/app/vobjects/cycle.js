define(["vobjects/vobject", "vobjects/vobject_args"],
function(vobject, vobject_args) {
  class Cycle extends vobject.VObject {
    num_inputs() { return 1; }
    num_outputs() { return 1; }

    constructor(frequency = 440) {
      super();
      this.frequency = frequency;
    }

    generate(context, inputs, outputs) {
      let frequency = 0 in inputs ? inputs[0] : this.frequency;
      let radians_per_sample = (frequency * 2 * Math.PI) / context.sample_rate;
      let result = context.get_buffer();
      for (var i=0; i < result.length; i++) {
        result[i] = Math.cos((context.sample_time + i) * radians_per_sample);
      }

      return [result];
    }
  }

  Cycle.vobject_class = "cycle~";

  return Cycle;
});
