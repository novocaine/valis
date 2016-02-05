define(['app/vobjects/vobject', 'app/util'],
(vobject, util) => {
  class Log extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 0; }

    generate(context, inputs, outputs) {
      if (!inputs[0]) {
        return [];
      }
      if (util.isAudioArray(inputs[0])) {
        // too spammy
        console.log('(audio)');
      } else {
        console.log(JSON.stringify(inputs[0]));
      }
      return [];
    }
  }

  Log.vobjectClass = 'log';
  Log.vobjectSymbol = 'log';

  return Log;
});
