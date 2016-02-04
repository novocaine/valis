define([],
() => {
  return {
    isAudioArray: (object) => {
      // typeof doesn't even remotely work :/
      return Object.prototype.toString.call(object) === '[object Float32Array]';
    },

    allocBuffer: (samples) => new Float32Array(samples)
  };
});
