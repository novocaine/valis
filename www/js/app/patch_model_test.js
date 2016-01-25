define(['app/patch_model', 'app/vobjects/cycle', 'lodash'],
(PatchModel, Cycle, _) => {
  describe('PatchModel', () => {
    it('should toJSON with a vobject in it', () => {
      const patchModel = new PatchModel();
      const graph = patchModel.graph;
      const cycle = new Cycle();
      graph.addVobject(cycle);
      const json = patchModel.toJSON();
      expect(_.equals(json, {
        vobjects: {
          [cycle.id]: {
            vobjectClass: 'cycle~',
            frequency: cycle.frequency
          }
        }
      })).toBe(true);
    });
  });
});
