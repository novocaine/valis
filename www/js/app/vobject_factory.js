define(['app/vobjects/js', 'app/vobjects/dac', 'app/vobjects/cycle',
        'app/vobjects/binary_ops', 'app/vobjects/delay', 'app/vobjects/midi',
        'app/vobjects/mtof', 'app/vobjects/log',
        'lodash'],
(JS, DAC, Cycle, binaryOps, Delay, Midi, MtoF, Log, _) => {
  // register them here
  const classList = [JS, DAC, Cycle, binaryOps.Mul, binaryOps.Add, Delay, Midi,
    MtoF, Log];
  const vobjectClasses = _.fromPairs(classList.map((_class) =>
    [_class.vobjectClass, _class]
  ));


  const create = (vobjectClassname, id, ...args) => {
    if (!(vobjectClassname in vobjectClasses)) {
      throw new Error(`vobject with class ${vobjectClassname} not found`);
    }
    const vobject = new vobjectClasses[vobjectClassname](...args);
    vobject.id = (id === undefined || id === null) ? _.uniqueId() : id;
    return vobject;
  };

  return {
    vobjectClasses, create
  };
});
