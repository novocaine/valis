define(['app/vobjects/vobject', 'app/engine', 'app/vobjects/time',
        'app/vobjects/recorder', 'app/vobjects/cycle', 'app/vobjects/dac',
        'app/vobject_factory',
        'lodash'],
(vobject, engine, Time, Recorder, Cycle, DAC, VObjectFactory, _) => {
  const printObject = (obj) => {
    return JSON.stringify(obj, (k, v) => {
      if (v === undefined) {
        return '(undefined)';
      }

      return v;
    });
  };
  beforeEach(() => {
    jasmine.addMatchers({
      toDeepEqual: (util, customEqualityTesters) => {
        return {
          compare: (actual, expected) => {
            return {
              pass: _.isEqual(actual, expected),
              message: `Expected ${printObject(actual)} to equal ` +
                `${printObject(expected)}`
            };
          }
        };
      }
    });
  });
  const vobjectFactory = new VObjectFactory(0);
  describe('VObjectGraph', () => {
    describe('addVobject', () => {
      it('should add an empty entry in .dedges', () => {
        const graph = new engine.VObjectGraph();
        const obj1 = vobjectFactory.create('log');
        graph.addVobject(obj1);
        expect(graph.dedges[obj1.id]).toEqual({});
      });

      it('should initially register the object as a leaf', () => {
        const graph = new engine.VObjectGraph();
        const obj = vobjectFactory.create('log');
        graph.addVobject(obj);
        expect(graph.leaves[obj.id]).toBe(obj);
      });
    });

    describe('removeVobject', () => {
      it('should remove the corresponding vobject from leaves', () => {
        const graph = new engine.VObjectGraph();
        const obj = vobjectFactory.create('log');
        graph.addVobject(obj);
        expect(graph.leaves[obj.id]).toBe(obj);
        graph.removeVobject(obj);
        expect(graph.leaves[obj.id]).toBe(undefined);
      });

      it('should remove any dedges coming from the vobject', () => {
        const graph = new engine.VObjectGraph();
        const obj1 = vobjectFactory.create('log');
        const obj2 = vobjectFactory.create('log');
        graph.addVobject(obj1);
        graph.addVobject(obj2);
        graph.addDedge(obj1, 3, obj2, 1);
        graph.removeVobject(obj1);
        expect(graph.dedges[obj1.id]).toBe(undefined);
      });

      it('should remove any dedges going to the vobject', () => {
        const graph = new engine.VObjectGraph();
        const obj1 = vobjectFactory.create('log');
        const obj2 = vobjectFactory.create('log');
        graph.addVobject(obj1);
        graph.addVobject(obj2);
        graph.addDedge(obj1, 3, obj2, 1);
        expect(graph.dedges[obj1.id]).not.toEqual({});
        graph.removeVobject(obj2);
        expect(graph.dedges[obj1.id]).toEqual(undefined);
      });
    });

    describe('addDedge', () => {
      it('should register a new dedge', () => {
        const graph = new engine.VObjectGraph();
        const obj1 = vobjectFactory.create('log');
        const obj2 = vobjectFactory.create('log');
        graph.addVobject(obj1);
        graph.addVobject(obj2);
        graph.addDedge(obj1, 3, obj2, 1);
        const edges = graph.dedges[obj1.id];
        const fromEdge3 = edges[3];
        const edge = fromEdge3[0];
        expect(edge.from.id).toBe(obj1.id);
        expect(edge.to.id).toBe(obj2.id);
        expect(edge.fromOutput).toBe(3);
        expect(edge.toInput).toBe(1);
      });

      it('should remove the from vobject from leaves', () => {
        const graph = new engine.VObjectGraph();
        const obj1 = vobjectFactory.create('log');
        const obj2 = vobjectFactory.create('log');
        graph.addVobject(obj1);
        graph.addVobject(obj2);
        expect(graph.leaves[obj1.id]).toBe(obj1);
        graph.addDedge(obj1, 3, obj2, 1);
        expect(graph.leaves[obj1.id]).toBe(undefined);
      });
    });
  });

  describe('removeDedge', () => {
    it('should add the from vobject back to leaves if its the last output', () => {
      const graph = new engine.VObjectGraph();
      const obj1 = vobjectFactory.create('log');
      const obj2 = vobjectFactory.create('log');
      graph.addVobject(obj1);
      graph.addVobject(obj2);
      graph.addDedge(obj1, 3, obj2, 1);
      expect(graph.leaves[obj2.id]).toBe(obj2);
      expect(graph.leaves[obj1.id]).toBe(undefined);
      graph.removeDedge(obj1, 3, obj2, 1);
      expect(graph.leaves[obj1.id]).toBe(obj1);
    });

    it('should remove the dedge from this.dedges', () => {
      const graph = new engine.VObjectGraph();
      const obj1 = vobjectFactory.create('log');
      const obj2 = vobjectFactory.create('log');
      graph.addVobject(obj1);
      graph.addVobject(obj2);
      graph.addDedge(obj1, 3, obj2, 1);
      expect(graph.dedges[obj1.id][3][0].to).toBe(obj2);
      graph.removeDedge(obj1, 3, obj2, 1);
      expect(graph.dedges[obj1.id][3]).toBe(undefined);
    });
  });

  describe('AudioProcess', () => {
    const createAudioProcess = () => {
      const sampleTime = 0;
      const sampleRate = 0;
      const graph = new engine.VObjectGraph();
      return new engine.AudioProcess(sampleTime, sampleRate, null, null,
        graph, null);
    };

    it('should run a simple graph of two nodes, one source one sink', () => {
      const ap = createAudioProcess();
      const sampletime = new Time({ id: 0 });
      // use a recorder to check the data comes through
      const recorder = new Recorder({ id: 1 });
      ap.graph.addVobject(sampletime);
      ap.graph.addVobject(recorder);
      ap.graph.addDedge(sampletime, 0, recorder, 0);
      ap.run();
      expect(recorder.record).toDeepEqual({ 0: { 0: '0' } });
    });

    it('should run a simple graph of two nodes, both leaves', () => {
      const ap = createAudioProcess();
      const recorder1 = new Recorder({ id: 0 });
      const recorder2 = new Recorder({ id: 1 });
      ap.graph.addVobject(recorder1);
      ap.graph.addVobject(recorder2);
      ap.run();
      expect(recorder1.record).toDeepEqual({ 0: {} });
      expect(recorder2.record).toDeepEqual({ 0: {} });
    });

    it('should run a graph of two nodes input to one', () => {
      const ap = createAudioProcess();
      const recorder = new Recorder({ id: 0 });
      const sampletime1 = new Time({ id: 1 });
      const sampletime2 = new Time({ id: 2 });
      ap.graph.addVobject(recorder);
      ap.graph.addVobject(sampletime1);
      ap.graph.addVobject(sampletime2);
      ap.graph.addDedge(sampletime1, 0, recorder, 0);
      ap.graph.addDedge(sampletime2, 0, recorder, 1);
      ap.run();
      expect(recorder.record).toDeepEqual({ 0: { 0: '0', 1: '0' } });
    });

    it('should run a graph of two nodes input to one', () => {
      const ap = createAudioProcess();
      const recorder = new Recorder({ id: 0 });
      const sampletime1 = new Time({ id: 1 });
      const sampletime2 = new Time({ id: 2 });
      ap.graph.addVobject(recorder);
      ap.graph.addVobject(sampletime1);
      ap.graph.addVobject(sampletime2);
      ap.graph.addDedge(sampletime1, 0, recorder, 0);
      ap.graph.addDedge(sampletime2, 0, recorder, 1);
      ap.run();
      expect(recorder.record).toDeepEqual({ 0: { 0: '0', 1: '0' } });
    });

    it('should run a graph where an output is connected to two inputs', () => {
      const ap = createAudioProcess();
      const recorder = new Recorder({ id: 0 });
      const sampletime = new Time({ id: 1 });
      ap.graph.addVobject(recorder);
      ap.graph.addVobject(sampletime);
      ap.graph.addDedge(sampletime, 0, recorder, 0);
      ap.graph.addDedge(sampletime, 0, recorder, 1);
      ap.run();
      expect(recorder.record).toDeepEqual({ 0: { 0: '0', 1: '0' } });
    });

    it('should run a graph where an output is connected to two inputs', () => {
      const ap = createAudioProcess();
      const recorder = new Recorder({ id: 0 });
      const sampletime = new Time({ id: 1 });
      ap.graph.addVobject(recorder);
      ap.graph.addVobject(sampletime);
      ap.graph.addDedge(sampletime, 0, recorder, 0);
      ap.graph.addDedge(sampletime, 0, recorder, 1);
      ap.run();
      expect(recorder.record).toDeepEqual({ 0: { 0: '0', 1: '0' } });
    });
  });

  /* this is a neat integration test, but it causes an annoying beep :D
  describe('Engine', function() {
    it('should put data to the DAC', function() {
      const theEngine = new engine.Engine();
      const cycle = new Cycle();
      const dac = new DAC();

      theEngine.graph.addVobject(cycle);
      theEngine.graph.addVobject(dac);

      // stereo
      theEngine.graph.addDedge(cycle, 0, dac, 0);
      theEngine.graph.addDedge(cycle, 0, dac, 1);

      theEngine.start();

      window.setTimeout(function() {
        theEngine.stop();
      }, 1000);
    });
  }); */
});
