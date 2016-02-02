define(['app/vobjects/js', 'app/vobjects/dac', 'app/vobjects/cycle',
        'app/vobjects/binary_ops',
        'lodash'],
(JS, DAC, Cycle, binaryOps, _) => {
  // register them here
  const classList = [JS, DAC, Cycle, binaryOps.Mul, binaryOps.Add];
  const vobjectClasses = _.object(classList.map((_class) =>
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
