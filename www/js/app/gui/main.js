define(["lib/react", 
        "app/gui/jsx/patch", 
        "app/gui/jsx/doc", 
        "app/engine",
        "app/vobject_factory",
        "app/patch_model"], 
function(React, patch, doc, engine, vobject_factory, PatchModel) {
  var init = function() {
    // entry point for the app. create a new blank document and render the gui
    var model = new PatchModel();

    // enable audio by default
    model.enable_audio();

    React.renderComponent(doc.Doc({ patch_model: model }), 
      document.body);
  };

  return {
    init: init
  }
});
