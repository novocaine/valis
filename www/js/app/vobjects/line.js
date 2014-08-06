define(["vobjects/vobject", "vobjects/vobject_args"],
function(vobject, vobject_args) {
  class Line extends vobject.VObject {
    constructor(initial_value=0, target_time=0) {
      super();
      this.target_time = target_time;
      this.val = initial_value;
    }

    num_inputs() { return 2; }
    num_outputs() { return 2; }

    process(context) {
      // process control messages.
      //
      // input1 - target time (ms)
      var target_time_msg = context.input_buffers[1];
      if (target_time_msg) {
        this.target_time = parseFloat(target_time_msg.data) / 1000 
          / context.sample_rate;
      }

      // input0 - set target val (and start ramp)
      var msg = context.input_buffers[0];
      if (msg) {
        this.target_val = msg.data;
        this.start_time = context.sample_time;
        this.start_val = this.val;
      }

      if (context.output_buffers[0]) {
        var num_ramp_samples = 0;

        if (this.target_val !== this.val) {
          var m = (this.target_val - this.start_val) / this.target_time;

          // time between when the ramp started and now
          var dt = context.sample_time - this.start_time;
          num_ramp_samples = Math.min(context.output_buffers[0].length, 
                                      this.target_time - dt, 0);

          // iterate while ramping
          for (var s=0; s < num_ramp_samples; s++) {
            var val = this.start_val + dt * m;
            context.output_buffers[0][s] = val;
            dt++;
          }
        }

        // iterate after ramping (hold constant)
        for (s=num_ramp_samples; s < context.output_buffers[0].length; s++) {
          context.output_buffers[0][s] = this.target_val;
        }

        this.val = context.output_buffers[0][context.output_buffers[0].length-1];
      }
    }
  }
    
  Line.vobject_class = "line~";
  Line.description = "Same as MAX/MSP's line~ object";

  return {
    Line: Line
  }
});
