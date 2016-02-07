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
          // TODO: show error message
          const model = new PatchModel();
          start(model);
        });
    } else {
      start(new PatchModel());
    }
  };

  const start = (model) => {
    const docComponent = doc.render(model);
    // enable audio by default, but delay it being enabled to try to allow
    // everything to settle - otherwise you get nasty pops while the browsers
    // still buzzing about rendering
    window.setTimeout(() => {
      model.enableAudio();
      docComponent.setState({});
    }, 500);
  };

  return { init };
});
