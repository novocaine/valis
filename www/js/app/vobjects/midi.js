define(['lodash', 'app/vobjects/vobject', 'app/msg'], (_, vobject, Message) => {
  class Midi extends vobject.VObject {
    numInputs() { return 0; }
    numOutputs() { return 1; }

    constructor(options) {
      super(options);
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
      const message = {
        cmd: data[0] >> 4,
        channel: data[0] & 0xf,
        type: data[0] & 0xf0,
        note: data[1],
        velocity: data[2],
        timeStamp: event.receivedTime
      };
      this._messages.push(message);
    }

    generate(context, inputs, outputs) {
      const result = [this._messages.map((msg) => {
        // this is going to be a time before the start of the current context's
        // sampleTime, as the note happened in the past
        const sampleTime = Math.round(((msg.timeStamp - context.domTimestamp) / 1000.0 *
          context.sampleRate) + context.sampleTime);
        return new Message(sampleTime, msg);
      })];
      this._messages = [];
      return result;
    }
  }

  Midi.vobjectClass = 'midi';
  Midi.vobjectSymbol = 'midi';

  return Midi;
});
