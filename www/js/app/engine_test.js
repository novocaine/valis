define(["vobjects/vobject", "engine"], 
  function(vobject, engine) {
  /*describe('AudioProcess', function() {
    describe('run', function() {
      it('should transfer data for a 1 dedge graph', function() {
        class Source extends vobject.VObject {
          process(t, input_buffers, output_buffers) {
            output_buffers[0] = "data";
          }
        }

        class Sink extends vobject.VObject {
          process(t, input_buffers, output_buffesr) {
            this.result = input_buffers[0];
          }
        }
      
        var graph = new engine.VObjectGraph();
        var sink = new Sink();
        graph.add_vobject(new Source());
        graph.add_vobject(sink);
        var ap = AudioProcess(42, graph, new engine.BufferPool());
        ap.run();
        assert.equal(sink.result, "data");
      });
    });
  });*/

  describe('VObjectGraph', function() {
    describe('add_vobject', function() {
      it('should add an empty entry in .dedges', function() {
        var graph = new engine.VObjectGraph();
        var obj1 = new vobject.VObject();
        graph.add_vobject(obj1);
        expect(graph.dedges[obj1.id]).toEqual({});
      });

      it('should initially register the object as a source', function() {
        var graph = new engine.VObjectGraph();
        var obj = new vobject.VObject();
        graph.add_vobject(obj);
        expect(graph.sources[obj.id]).toBe(obj);
      });
    });

    describe('remove_vobject', function() {
      it('should remove the corresponding vobject from sources', function() {
        var graph = new engine.VObjectGraph();
        var obj = new vobject.VObject();
        graph.add_vobject(obj);
        expect(graph.sources[obj.id]).toBe(obj)
        graph.remove_vobject(obj);
        expect(graph.sources[obj.id]).toBe(undefined);
      });

      it('should remove any dedges coming from the vobject', function() {
        var graph = new engine.VObjectGraph();
        var obj1 = new vobject.VObject();
        var obj2 = new vobject.VObject();
        graph.add_vobject(obj1);
        graph.add_vobject(obj2);
        graph.add_dedge(obj1, 3, obj2, 1);
        graph.remove_vobject(obj1);
        expect(graph.dedges[obj1.id]).toBe(undefined);
      });

      it('should remove any dedges going to the vobject', function() {
        var graph = new engine.VObjectGraph();
        var obj1 = new vobject.VObject();
        var obj2 = new vobject.VObject();
        graph.add_vobject(obj1);
        graph.add_vobject(obj2);
        graph.add_dedge(obj1, 3, obj2, 1);
        expect(graph.dedges[obj1.id]).not.toEqual({});
        graph.remove_vobject(obj2);
        expect(graph.dedges[obj1.id]).toEqual({});
      });
    });

    describe('add_dedge', function() {
      it('should register a new dedge', function() {
        var graph = new engine.VObjectGraph();
        var obj1 = new vobject.VObject();
        var obj2 = new vobject.VObject();
        graph.add_vobject(obj1);
        graph.add_vobject(obj2);
        graph.add_dedge(obj1, 3, obj2, 1);
        var edges = graph.dedges[obj1.id];
        var from_edge_3 = edges[3];
        var edge = from_edge_3[0];
        expect(edge.from.id).toBe(obj1.id);
        expect(edge.to.id).toBe(obj2.id);
        expect(edge.from_output).toBe(3);
        expect(edge.to_input).toBe(1);
      });

      it('should remove the vobject from sources', function() {
        var graph = new engine.VObjectGraph();
        var obj1 = new vobject.VObject();
        var obj2 = new vobject.VObject();
        graph.add_vobject(obj1);
        graph.add_vobject(obj2);
        expect(graph.sources[obj1.id]).toBe(obj1)
        graph.add_dedge(obj1, 3, obj2, 1);
        expect(graph.sources[obj2.id]).toBe(undefined);
      });

      it('should increase num_active_inputs by 1 for the target vobj', function() {
        var graph = new engine.VObjectGraph();
        var obj1 = new vobject.VObject();
        var obj2 = new vobject.VObject();
        graph.add_vobject(obj1);
        graph.add_vobject(obj2);
        graph.add_dedge(obj1, 3, obj2, 1);
        expect(graph.num_active_inputs[obj2.id]).toBe(1)
      });
    });
  });

  describe('remove_dedge', function() {
    it('should add the arrow vobject back to sources if its the last input', 
      function() 
    {
      var graph = new engine.VObjectGraph();
      var obj1 = new vobject.VObject();
      var obj2 = new vobject.VObject();
      graph.add_vobject(obj1);
      graph.add_vobject(obj2);
      graph.add_dedge(obj1, 3, obj2, 1);
      expect(graph.sources[obj1.id]).toBe(obj1);
      expect(graph.sources[obj2.id]).toBe(undefined);
      graph.remove_dedge(obj1, 3, obj2, 1);
      expect(graph.sources[obj2.id]).toBe(obj2);
    });

    it('should remove the dedge from this.dedges', function() {
      var graph = new engine.VObjectGraph();
      var obj1 = new vobject.VObject();
      var obj2 = new vobject.VObject();
      graph.add_vobject(obj1);
      graph.add_vobject(obj2);
      graph.add_dedge(obj1, 3, obj2, 1);
      expect(graph.dedges[obj1.id][3][0].to).toBe(obj2);
      graph.remove_dedge(obj1, 3, obj2, 1);
      expect(graph.dedges[obj1.id][3]).toBe(undefined);
    });

    it('should reduce num_active_inputs by 1 for the arrow vobject', function() {
      var graph = new engine.VObjectGraph();
      var obj1 = new vobject.VObject();
      var obj2 = new vobject.VObject();
      graph.add_vobject(obj1);
      graph.add_vobject(obj2);
      graph.add_dedge(obj1, 3, obj2, 1);
      expect(graph.num_active_inputs[obj2.id]).toBe(1);
      graph.remove_dedge(obj1, 3, obj2, 1);
      expect(graph.num_active_inputs[obj2.id]).toBe(0);
    });
  });
});
