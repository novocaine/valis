define(["vobjects/vobject", "vobjects/vobject_args"],
function(vobject, vobject_args) {
  class Echo extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    generate(context, inputs, outputs) {
      return [inputs[0]];
    }
  }
})
