define(["app/engine", "lib/lodash"], function(engine, _) {
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
      };
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

    toJSON() {
      let dedges = [];
      this.engine.graph.iter_deges((dedge) => {
        dedges.push({
          from: dedge.from.id,
          from_output: dedge.from_output,
          to: dedge.to.id,
          to_input: dedge.to_input
        });
      });

      let vobjects = _.reduce(this.engine.graph.vobjects, (memo, vobject) => {
        memo[vobject.id] = _.merge({
          vobject_class: vobject.vobject_class
        }, vobject.toJSON());
        return memo;
      }, {});

      return {
        vobject_positions: vobject_positions,
        dedges: dedges,
        vobjects: vobjects
      };
    }
  }

  return PatchModel;
});
