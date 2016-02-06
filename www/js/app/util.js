define([],
() => {
  const functions = {
    isAudioArray: (object) => {
      // typeof doesn't even remotely work :/
      return Object.prototype.toString.call(object) === '[object Float32Array]';
    },

    allocBuffer: (samples) => new Float32Array(samples),

    bpmToFrequency: (bpm, sampleRate) => {
      return bpm / 60.0 / sampleRate;
    },

    bpmToPeriod: (bpm, sampleRate) => {
      return 1.0 / functions.bpmToFrequency(bpm, sampleRate);
    }
  };

  return functions;
});
