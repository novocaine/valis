define(["vobjects/vobject", "vobjects/vobject_args", "control_message"],
function(vobject, vobject_args) {
  class Message extends vobject.VObject {
    num_inputs() { return 0; }
    num_outputs() { return 1; }

    process_args(args) {
      return vobject_args.process_argmap({
        "data": {}
      }, args);
    }

    trigger() {
      this.triggered = true;
    }

    process(context) {
      if (this.triggered) {
        context.output_buffers[0] = new control_message.ControlMessage(
          this.args.data);
        this.triggered = false;
      }
    }
  }
});
