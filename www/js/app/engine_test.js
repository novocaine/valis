define(["vobjects/vobject", "engine", "vobjects/time", "vobjects/recorder", 
        "vobjects/cycle", "vobjects/dac"], 
  function(vobject, engine, Time, Recorder, Cycle, DAC) {
  describe('VObjectGraph', function() {
    describe('add_vobject', function() {
      it('should add an empty entry in .dedges', function() {
        var graph = new engine.VObjectGraph();
        var obj1 = new vobject.VObject();
        graph.add_vobject(obj1);
        expect(graph.dedges[obj1.id]).toEqual({});
      });

      it('should initially register the object as a leaf', function() {
        var graph = new engine.VObjectGraph();
        var obj = new vobject.VObject();
        graph.add_vobject(obj);
        expect(graph.leaves[obj.id]).toBe(obj);
      });
    });

    describe('remove_vobject', function() {
      it('should remove the corresponding vobject from leaves', function() {
        var graph = new engine.VObjectGraph();
        var obj = new vobject.VObject();
        graph.add_vobject(obj);
        expect(graph.leaves[obj.id]).toBe(obj)
        graph.remove_vobject(obj);
        expect(graph.leaves[obj.id]).toBe(undefined);
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
        expect(graph.dedges[obj1.id]).toEqual(undefined);
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

      it('should remove the from vobject from leaves', function() {
        var graph = new engine.VObjectGraph();
        var obj1 = new vobject.VObject();
        var obj2 = new vobject.VObject();
        graph.add_vobject(obj1);
        graph.add_vobject(obj2);
        expect(graph.leaves[obj1.id]).toBe(obj1)
        graph.add_dedge(obj1, 3, obj2, 1);
        expect(graph.leaves[obj1.id]).toBe(undefined);
      });
    });
  });

  describe('remove_dedge', function() {
    it('should add the from vobject back to leaves if its the last output', 
      function() 
    {
      var graph = new engine.VObjectGraph();
      var obj1 = new vobject.VObject();
      var obj2 = new vobject.VObject();
      graph.add_vobject(obj1);
      graph.add_vobject(obj2);
      graph.add_dedge(obj1, 3, obj2, 1);
      expect(graph.leaves[obj2.id]).toBe(obj2);
      expect(graph.leaves[obj1.id]).toBe(undefined);
      graph.remove_dedge(obj1, 3, obj2, 1);
      expect(graph.leaves[obj1.id]).toBe(obj1);
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
  });

  describe('AudioProcess', function() {
    var create_audio_process = function() {
      var sample_time = 0;
      var sample_rate = 0;
      var graph = new engine.VObjectGraph();
      return new engine.AudioProcess(sample_time, sample_rate, null, null, 
        graph, null);
    };

    it('should run a simple graph of two nodes, one source one sink', function() {
      var ap = create_audio_process();
      var sampletime = new Time();
      // use a recorder to check the data comes through
      var recorder = new Recorder();
      ap.graph.add_vobject(sampletime);
      ap.graph.add_vobject(recorder);
      ap.graph.add_dedge(sampletime, 0, recorder, 0);
      ap.run();
      expect(_.isEqual(recorder.record, {0:{0:"0"}})).toEqual(true);
    });

    it('should run a simple graph of two nodes, both leaves', function() {
      var ap = create_audio_process();
      var recorder1 = new Recorder();
      var recorder2 = new Recorder();
      ap.graph.add_vobject(recorder1);
      ap.graph.add_vobject(recorder2);
      ap.run();
      expect(_.isEqual(recorder1.record, {0:{}})).toEqual(true);
      expect(_.isEqual(recorder2.record, {0:{}})).toEqual(true);
    });

    it('should run a graph of two nodes input to one', function() {
      var ap = create_audio_process();
      var recorder = new Recorder();
      var sampletime1 = new Time();
      var sampletime2 = new Time();
      ap.graph.add_vobject(recorder);
      ap.graph.add_vobject(sampletime1);
      ap.graph.add_vobject(sampletime2);
      ap.graph.add_dedge(sampletime1, 0, recorder, 0);
      ap.graph.add_dedge(sampletime2, 0, recorder, 1);
      ap.run();
      expect(_.isEqual(recorder.record, {0: { 0: "0", 1: "0" } })).toEqual(true);
    });

    it('should run a graph of two nodes input to one', function() {
      var ap = create_audio_process();
      var recorder = new Recorder();
      var sampletime1 = new Time();
      var sampletime2 = new Time();
      ap.graph.add_vobject(recorder);
      ap.graph.add_vobject(sampletime1);
      ap.graph.add_vobject(sampletime2);
      ap.graph.add_dedge(sampletime1, 0, recorder, 0);
      ap.graph.add_dedge(sampletime2, 0, recorder, 1);
      ap.run();
      expect(_.isEqual(recorder.record, {0: { 0: "0", 1: "0" } })).toEqual(true);
    });

    it('should run a graph where an output is connected to two inputs', function() {
      var ap = create_audio_process();
      var recorder = new Recorder();
      var sampletime = new Time();
      ap.graph.add_vobject(recorder);
      ap.graph.add_vobject(sampletime);
      ap.graph.add_dedge(sampletime, 0, recorder, 0);
      ap.graph.add_dedge(sampletime, 0, recorder, 1);
      ap.run();
      expect(_.isEqual(recorder.record, {0: { 0: "0", 1: "0" } })).toEqual(true);
    });

    it('should run a graph where an output is connected to two inputs', function() {
      var ap = create_audio_process();
      var recorder = new Recorder();
      var sampletime = new Time();
      ap.graph.add_vobject(recorder);
      ap.graph.add_vobject(sampletime);
      ap.graph.add_dedge(sampletime, 0, recorder, 0);
      ap.graph.add_dedge(sampletime, 0, recorder, 1);
      ap.run();
      expect(_.isEqual(recorder.record, {0: { 0: "0", 1: "0" } })).toEqual(true);
    });
  });

  /* this is a neat integration test, but it causes an annoying beep :D
  describe("Engine", function() {
    it('should put data to the DAC', function() {
      var the_engine = new engine.Engine();
      var cycle = new Cycle();
      var dac = new DAC();

      the_engine.graph.add_vobject(cycle);
      the_engine.graph.add_vobject(dac);

      // stereo
      the_engine.graph.add_dedge(cycle, 0, dac, 0);
      the_engine.graph.add_dedge(cycle, 0, dac, 1);

      the_engine.start();

      window.setTimeout(function() {
        the_engine.stop();
      }, 1000);
    });
  }); */
});
