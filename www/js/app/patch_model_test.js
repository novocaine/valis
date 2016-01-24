define(["patch_model", "vobjects/cycle"], function(PatchModel, cycle) {
  describe('PatchModel', function() {
    it('should toJSON with a vobject in it', function() {
      var patch_model = new PatchModel();
      var graph = patch_model.graph;
      var cycle = new Cycle();
      graph.add_vobject(cycle);
      var json = patch_model.toJSON();
      expect(_.equals(json, { 
        vobjects: {
          [cycle.id]: {
            vobject_class: "cycle~",
            frequency: cycle.frequency
          }
        }
      })).toBe(true);
    });
  });
});
