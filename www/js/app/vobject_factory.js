define(["app/vobjects/line"], function(line) {
  var class_list = [
    line.Line
  ];

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
  }
});
