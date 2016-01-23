define(["app/vobjects/line", "app/vobjects/js", 
        "app/vobjects/dac", "app/vobjects/cycle"], 
  function(Line, JS, DAC, Cycle) {
  // register them here
  var class_list = [Line, JS, DAC, Cycle];

  var vobject_classes = _.object(class_list.map(function(_class) {
    return [_class.vobject_class, _class];
  }));

  var create = function(vobject_classname) {
    if (!(vobject_classname in vobject_classes)) {
      throw new Error("vobject with class " + vobject_classname + " not found");
    }
    return new vobject_classes[vobject_classname];
  };

  return {
    vobject_classes: vobject_classes,
    create: create
  };
});
