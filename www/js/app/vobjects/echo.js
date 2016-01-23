define(["vobjects/vobject", "vobjects/vobject_args"],
function(vobject, vobject_args) {
  class Echo extends vobject.VObject {
    num_inputs() { return 1; }
    num_outputs() { return 1; }

    generate(context, inputs, outputs) {
      return [inputs[0]];
    }
  }
})
