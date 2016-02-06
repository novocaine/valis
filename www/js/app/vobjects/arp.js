define(['lodash', 'app/vobjects/vobject', 'app/msg', 'app/util'],
(_, vobject, Message, util) => {
  class Arpeggiator extends vobject.VObject {
    numInputs() { return 1; }
    numOutputs() { return 1; }

    constructor(...frequencies) {
      super(...frequencies);
      this.frequencies = _.map(frequencies, (s) => parseFloat(s));
    }

    nextFrequency() {
      return this.frequencies[Math.floor(Math.random() * this.frequencies.length)];
    }

    generate(context, inputs, outputs) {
      if (inputs[0] === undefined) {
        return [];
      }

      const frequencies = _.reduce(inputs[0], (memo, msg) => {
        // gen new freq on rising edge only
        if (msg.data) {
          memo.push(new Message(msg.sampleTime, this.nextFrequency()));
        }
        return memo;
      }, []);

      return [frequencies];
    }
  }

  Arpeggiator.vobjectClass = 'arpeggiator';
  Arpeggiator.vobjectSymbol = 'arp';

  return Arpeggiator;
});
