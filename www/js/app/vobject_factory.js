define(['app/vobjects/js', 'app/vobjects/dac', 'app/vobjects/cycle',
        'app/vobjects/binary_ops', 'app/vobjects/delay',
        'lodash'],
(JS, DAC, Cycle, binaryOps, Delay, _) => {
  // register them here
  const classList = [JS, DAC, Cycle, binaryOps.Mul, binaryOps.Add, Delay];
  const vobjectClasses = _.fromPairs(classList.map((_class) =>
    [_class.vobjectClass, _class]
  ));


  const create = (vobjectClassname, ...args) => {
    if (!(vobjectClassname in vobjectClasses)) {
      throw new Error(`vobject with class ${vobjectClassname} not found`);
    }
    return new vobjectClasses[vobjectClassname](...args);
  };

  return {
    vobjectClasses, create
  };
});
