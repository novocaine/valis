define(['app/vobjects/vobject'],
(vobject) => {
  class Echo extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    generate(context, inputs, outputs) {
      return [inputs[0]];
    }
  }

  return Echo;
});
