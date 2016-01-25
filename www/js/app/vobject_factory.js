define(['app/vobjects/js', 'app/vobjects/dac', 'app/vobjects/cycle',
        'lodash'],
(JS, DAC, Cycle, _) => {
  // register them here
  const classList = [JS, DAC, Cycle];
  const vobjectClasses = _.object(classList.map((_class) =>
    [_class.vobjectClass, _class]
  ));

  const create = (vobjectClassname) => {
    if (!(vobjectClassname in vobjectClasses)) {
      throw new Error(`vobject with class ${vobjectClassname} not found`);
    }
    return new vobjectClasses[vobjectClassname];
  };

  return {
    vobjectClasses, create
  };
});
