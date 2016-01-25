define([
  'app/gui/jsx/doc',
  'app/patch_model'],
(doc, PatchModel) => {
  const init = () => {
    // entry point for the app. create a new blank document and render the gui
    const model = new PatchModel();

    // enable audio by default
    model.enableAudio();

    doc.render(model);
  };

  return { init };
});
