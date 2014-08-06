define([], function() {
  var ArgsError = function(message) { 
    this.message = message;
  };
  ArgsError.prototype = new Error();
  ArgsError.prototype.constructor = ArgsError;

  return {
    process_argmap: function(argmap, args) {
      var result = {};
      args = args || {};

      for (var k in argmap) {
        if (!(k in args)) {
          if ("default" in argmap[k]) {
            result[k] = argmap[k]["default"];
          } else {
            throw new ArgsError("Mandatory key " + k + " not provided");
          }
        } else {
          result[k] = args[k];
        }
      }

      return result;
    }
  }
});
