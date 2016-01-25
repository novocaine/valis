define(['app/engine', 'app/vobjects/cycle', 'app/vobjects/dac'],
(engine, vobjectsCycle, vobjectsDac) => {
  const startTone = () => {
    const e = new engine.Engine();
    const cycle1 = new vobjectsCycle.Cycle(
      { frequency: 880 }
    );
    const cycle2 = new vobjectsCycle.Cycle(
      { frequency: 220 }
    );
    const dac = new vobjectsDac.DAC();
    e.graph.addVobject(cycle1);
    e.graph.addDedge(cycle1, 0, dac, 0);
    e.graph.addVobject(cycle2);
    e.graph.addDedge(cycle2, 0, dac, 1);
    e.start();
  };

  return { startTone };
});
