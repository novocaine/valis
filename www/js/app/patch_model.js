define(['app/engine', 'lodash', 'app/vobject_factory'],
(engine, _, vobjectFactory) => {
  class PatchModel {
    /**
     * Constructs a blank patch
     */
    constructor() {
      // TODO: move this into a parent 'doc' when we support sub-patches
      this.engine = new engine.Engine();
      this.graph = this.engine.graph;
      this.vobjectPositions = {};
    }

    addVobject(vobject, x, y) {
      // add to underlying graph
      this.graph.addVobject(vobject);
      this.vobjectPositions[vobject.id] = { x, y };
    }

    updateVobjectArgs(vobject, args) {
      // delete and re-instantiate the object with new arguments
      const newVobject = vobjectFactory.create(
        vobject.constructor.vobjectClass, ...args);
      this.graph.replaceVobject(vobject, newVobject);
      this.vobjectPositions[newVobject.id] = this.vobjectPositions[vobject.id];
      delete this.vobjectPositions[vobject.id];
    }

    // keep positions and sizes of vobjects up to date here after each render
    // for fast access when rendering dedges (otherwise the dedge renderer
    // would have to measure the items every time, which is slow)

    setVobjectPosition(vobjectId, x, y) {
      this.vobjectPositions[vobjectId] = { x, y };
    }

    getVobjectPosition(vobjectId) {
      return this.vobjectPositions[vobjectId];
    }

    enableAudio(enabled = true) {
      enabled ? this.engine.start() : this.engine.stop();
    }

    audioEnabled() {
      return this.engine.running;
    }

    toJSON() {
      const dedges = [];
      this.engine.graph.iterDeges((dedge) => {
        dedges.push({
          from: dedge.from.id,
          fromOutput: dedge.fromOutput,
          to: dedge.to.id,
          toInput: dedge.toInput
        });
      });

      const vobjects = _.reduce(this.engine.graph.vobjects, (memo, vobject) => {
        memo[vobject.id] = _.merge({ // eslint-disable-line no-param-reassign
          vobjectClass: vobject.vobjectClass
        }, vobject.toJSON());
        return memo;
      }, {});

      return { dedges, vobjects };
    }
  }

  return PatchModel;
});
