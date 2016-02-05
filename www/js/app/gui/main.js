define([
  'app/gui/jsx/doc',
  'app/patch_model',
  'jquery'],
(doc, PatchModel, $) => {
  const init = () => {
    // entry point for the app. Create a ocument and render the gui.

    // do we have a JSON document specified in the url?
    const params = location.search;
    const match = params.match(/\?.*patch=([^&]+)/);
    if (match) {
      $.get(match[1])
        .done((json) => {
          const model = new PatchModel(json);
          start(model);
        })
        .fail(() => {
          const model = new PatchModel();
          start(model);
        });
    } else {
      start(new PatchModel());
    }
  };

  const start = (model) => {
    // enable audio by default
    model.enableAudio();
    doc.render(model);
  };

  return { init };
});
