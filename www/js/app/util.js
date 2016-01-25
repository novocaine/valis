define([],
() => {
  return {
    isAudioArray: (object) =>
      // typeof doesn't even remotely work :/
      Object.prototype.toString.call(object) === '[object Float32Array]'
  };
});
