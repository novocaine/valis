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
      // TODO: move this into a parent 'doc' when we support sub-patches
      this.engine = new engine.Engine();
      this.graph = this.engine.graph;
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
      this.vobject_positions[vobject_id] = { 
        x: x, 
        y: y
      }
    }

    get_vobject_position(vobject_id) {
      return this.vobject_positions[vobject_id];
    }

    enable_audio(enabled = true) {
      enabled ? this.engine.start() : this.engine.stop();
    }

    audio_enabled() {
      return this.engine.running;
    }
  }

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
