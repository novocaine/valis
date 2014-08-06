define(["lib/react", 
        "app/gui/jsx/patch", 
        "app/gui/jsx/doc", 
        "app/engine",
        "app/vobject_factory"], 
function(React, patch, doc, engine, vobject_factory) {
  class PatchModel {
    /**
     * Constructs a blank patch 
     */
    constructor() {
      this.graph = new engine.VObjectGraph();
      this.vobject_positions = {};
    }

    add_vobject(vobject, position) {
      // add to underlying graph
      this.graph.add_vobject(vobject);
      this.vobject_positions[vobject.id] = position;
    }
  }

  var init = function() {
    // create a new blank document and render the gui
    var model = new PatchModel();
    React.renderComponent(doc.Doc({ patch_model: model }), 
      document.body);
  };

  return {
    init: init
  }
});
