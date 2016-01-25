define(['app/vobjects/vobject'],
(vobject) => {
  class JS extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    constructor(script) {
      super();
      this.script = script;
    }

    generate(contxt, inputs, outputs) {
      return eval(this.script);
    }
  }

  JS.vobjectClass = 'js';

  return JS;
});
