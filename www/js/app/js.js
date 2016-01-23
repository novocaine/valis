define(["vobjects/vobject"],
function(vobject, util, vconsole) {
  class JS extends vobject.VObject {
    num_inputs() { return 1; }
    num_outputs() { return 1; }

    constructor(script) {
      super();
      this.script = script;
    }

    generate(contxt, inputs, outputs) {
      return eval(this.script);
    }
  }
});
