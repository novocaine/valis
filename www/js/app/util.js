define([],
function() {
  return { 
    is_audio_array: function(object) {
      // typeof doesn't even remotely work :/
      return Object.prototype.toString.call(object) == "[object Float32Array]"
    }
  }
});
