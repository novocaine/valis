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

    add_vobject(vobject, x, y) {
      // add to underlying graph
      this.graph.add_vobject(vobject);
      this.vobject_positions[vobject.id] = {
        x: x, 
        y: y
      };
    }

    // keep positions and sizes of vobjects up to date here after each render
    // for fast access when rendering dedges (otherwise the dedge renderer
    // would have to measure the items every time, which is slow)

    set_vobject_position(vobject_id, x, y) {
      this.vobject_positions[vobject.id] = { 
        x: x, 
        y: y
      }
    }

    set_vobject_size(vobject_id, dx, dy) {
      this.vobject_positions[vobject_id].dx = dx;
      this.vobject_positions[vobject_id].dy = dy;
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
