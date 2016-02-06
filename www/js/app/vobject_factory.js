define(['app/vobjects/js', 'app/vobjects/dac', 'app/vobjects/cycle',
        'app/vobjects/binary_ops', 'app/vobjects/delay', 'app/vobjects/midi',
        'app/vobjects/mtof', 'app/vobjects/log', 'app/vobjects/adenv',
        'lodash'],
(JS, DAC, Cycle, binaryOps, Delay, Midi, MtoF, Log, ADEnvelope, _) => {
  // register them here
  const classList = [JS, DAC, Cycle, binaryOps.Mul, binaryOps.Add, Delay, Midi,
    MtoF, Log, ADEnvelope];

  class VObjectFactory {
    constructor(nextId) {
      this.nextId = nextId;
    }

    create(vobjectClassname, id, ...args) {
      if (!(vobjectClassname in this.constructor.vobjectClasses)) {
        throw new Error(`vobject with class ${vobjectClassname} not found`);
      }
      const vobject = new this.constructor.vobjectClasses[vobjectClassname](...args);
      vobject.id = (id === undefined || id === null) ? this.nextId++ : id;
      return vobject;
    }
  }

  VObjectFactory.vobjectClasses = _.fromPairs(classList.map((_class) =>
    [_class.vobjectClass, _class]
  ));

  return VObjectFactory;
});
