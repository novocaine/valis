define(['app/vobjects/js', 'app/vobjects/dac', 'app/vobjects/cycle',
        'app/vobjects/binary_ops', 'app/vobjects/delay', 'app/vobjects/midi',
        'app/vobjects/mtof', 'app/vobjects/log', 'app/vobjects/adsr',
        'app/vobjects/pulse', 'app/vobjects/arp',
        'lodash'],
(JS, DAC, Cycle, binaryOps, Delay, Midi, MtoF, Log, ADSREnvelope, Pulse,
Arpeggiator, _) => {
  // register them here
  const classList = [JS, DAC, Cycle, binaryOps.Mul, binaryOps.Add, Delay, Midi,
    MtoF, Log, ADSREnvelope, Pulse, Arpeggiator];

  class VObjectFactory {
    constructor(nextId) {
      this.nextId = nextId;
    }

    create(vobjectClassname, id, ...args) {
      if (!(vobjectClassname in this.constructor.vobjectClasses)) {
        throw new Error(`vobject with class ${vobjectClassname} not found`);
      }
      id = (id === undefined || id === null) ? this.nextId++ : id;
      const vobject = new this.constructor.vobjectClasses[vobjectClassname]({ id },
        ...args);
      return vobject;
    }
  }

  VObjectFactory.vobjectClasses = _.fromPairs(classList.map((_class) =>
    [_class.vobjectClass, _class]
  ));

  return VObjectFactory;
});
