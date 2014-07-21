define(["engine", "vobjects/cycle", "vobjects/dac"], 
function(engine, vobjects_cycle, vobjects_dac) {
  return {
    start_tone: function() {
      var e = new engine.Engine();
      var cycle1 = new vobjects_cycle.Cycle(
        { frequency: 880 }
      );
      var cycle2 = new vobjects_cycle.Cycle(
        { frequency: 220 }
      );
      var dac = new vobjects_dac.DAC();
      e.graph.add_vobject(cycle1);
      e.graph.add_dedge(cycle1, 0, dac, 0);
      e.graph.add_vobject(cycle2);
      e.graph.add_dedge(cycle2, 0, dac, 1);
      e.start();
    }
  }
});
