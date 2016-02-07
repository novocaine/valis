define(['app/engine', 'lodash', 'app/vobject_factory'],
(engine, _, VObjectFactory) => {
  class PatchModel {
    constructor(patchJSON) {
      // TODO: move this into a parent 'doc' when we support sub-patches
      this.engine = new engine.Engine();
      this.graph = this.engine.graph;

      if (!patchJSON) {
        // new blank document
        this.vobjectPositions = {};
        this.vobjectFactory = new VObjectFactory(0);
      } else {
        const json = _.isString(patchJSON) ? JSON.parse(patchJSON) : patchJSON;
        this.vobjectPositions = json.vobjectPositions;
        this.vobjectFactory = new VObjectFactory(json.nextVobjectId);

        _.each(json.vobjects, (vobjectDesc, id) => {
          const vobject = this.vobjectFactory.create(vobjectDesc.vobjectClass,
            id, ...vobjectDesc.args);
          this.graph.addVobject(vobject);
        });

        _.each(json.dedges, (dedgeDesc) => {
          this.graph.addDedge(this.graph.vobjects[dedgeDesc.from],
            dedgeDesc.fromOutput,
            this.graph.vobjects[dedgeDesc.to],
            dedgeDesc.toInput);
        });
      }
    }

    addVobject(vobject, x, y) {
      // add to underlying graph
      this.graph.addVobject(vobject);
      this.vobjectPositions[vobject.id] = { x, y };
    }

    updateVobjectArgs(vobject, args) {
      // delete and re-instantiate the object with new arguments
      const newVobject = this.vobjectFactory.create(
        vobject.constructor.vobjectClass, null, ...args);
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
      const dedges = _.map(this.engine.graph.getAllDedges(), (dedge) => {
        return {
          from: dedge.from.id,
          fromOutput: dedge.fromOutput,
          to: dedge.to.id,
          toInput: dedge.toInput
        };
      });

      const vobjects = _.reduce(this.engine.graph.vobjects, (memo, vobject) => {
        memo[vobject.id] = {
          vobjectClass: vobject.constructor.vobjectClass,
          args: vobject.args
        };
        return memo;
      }, {});

      return { dedges, vobjects, vobjectPositions: this.vobjectPositions,
        nextVobjectId: this.vobjectFactory.nextId };
    }
  }

  return PatchModel;
});
