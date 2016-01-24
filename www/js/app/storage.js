define([], function() {
  let save = function(patch_model, name, version) {
    window.localStorage.setItem(
      JSON.stringify([name, version]),
      JSON.stringify(patch_model_json));
  };

  let load = function(patch_model, name, version) {

  };

  return {
    save: save,
    load: load
  }
});
