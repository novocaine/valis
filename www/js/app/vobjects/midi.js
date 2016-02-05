define(['lodash', 'app/vobjects/vobject'], (_, vobject) => {
  class Midi extends vobject.VObject {
    numInputs() { return 0; }
    numOutputs() { return 1; }

    constructor() {
      super();
      this._messages = [];

      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({}).then((midiAccess) => {
          // success. TODO: this listens on all interfaces, should be a way to
          // select
          for (const input of midiAccess.inputs) {
            input[1].onmidimessage = _.bind(this.onMIDIMessage, this);
            console.log(`registered midi input ${input[1].name}`);
          }
        },
        (e) => {
          // failure
          throw Error(`Error initializing MIDI: ${e.toString()}`);
        });
      } else {
        throw Error('This browser does not support MIDI');
      }
    }

    onMIDIMessage(event) {
      // the message format is pretty damn unwieldy, so convert it into
      // something legible..
      const data = event.data;
      const msg = {
        cmd: data[0] >> 4,
        channel: data[0] & 0xf,
        type: data[0] & 0xf0,
        note: data[1],
        velocity: data[2],
        timeStamp: event.receivedTime
      };
      this._messages.push(msg);
    }

    generate(context, inputs, outputs) {
      const result = [this._messages.map((msg) => {
        // this is going to be a time before the start of the current context's
        // sampleTime, as the note happened in the past
        msg.sampleTime = ((msg.timeStamp - context.domTimestamp) / 1000.0 *
          context.sampleRate) + context.sampleTime;
        return msg;
      })];
      this._messages = [];
      return result;
    }
  }

  Midi.vobjectClass = 'midi';
  Midi.vobjectSymbol = 'midi';

  return Midi;
});
