define(['app/vobjects/vobject'],
(vobject) => {
  class Log extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 0; }

    generate(context, inputs, outputs) {
      if (!inputs[0]) {
        return [];
      }
      console.log(JSON.stringify(inputs));
      return [];
    }
  }

  Log.vobjectClass = 'log';
  Log.vobjectSymbol = 'log';

  return Log;
});
