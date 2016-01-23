define(["vobjects/vobject", "vobjects/vobject_args"],
function(vobject, vobject_args) {
  class Recorder extends vobject.VObject {
    num_inputs() { return 1; }
    num_outputs() { return 0; }
     
    constructor(args) {
      super(args);
      this.record = {};
    }

    generate(context, inputs, outputs) {
      var record = {};
      for (var input in inputs) {
        record[input] = inputs[input].toString();
      }
      this.record[context.sample_time] = record;
    }
  }

  return Recorder;
});
