define(['app/vobjects/vobject'],
(vobject) => {
  class JS extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    constructor(options, script) {
      super(options, script);
      this.script = script;
    }

    generate(contxt, inputs, outputs) {
      const result = eval(this.script);
      // if result isn't an array, make it into one (i.e output one value) as a
      // convenience
      if (Array.isArray(result)) {
        return result;
      }

      return [result];
    }

    static processArgString(argString) {
      return [argString];
    }
  }

  JS.vobjectClass = 'js';
  JS.vobjectSymbol = '&gt;';

  return JS;
});
