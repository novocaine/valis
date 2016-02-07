define(['app/patch_model', 'app/vobjects/cycle', 'lodash'],
(PatchModel, Cycle, _) => {
  describe('PatchModel', () => {
    it('should toJSON with a vobject in it', () => {
      const patchModel = new PatchModel();
      const graph = patchModel.graph;
      const cycle = new Cycle({ id: 0 });
      graph.addVobject(cycle);
      const json = patchModel.toJSON();
      expect(json).toDeepEqual({
        dedges: [],
        vobjects: {
          [cycle.id]: {
            vobjectClass: 'oscillator',
            args: [cycle.frequency]
          }
        },
        vobjectPositions: {},
        nextVobjectId: 0
      });
    });
  });
});
