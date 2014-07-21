requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/app',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app',
        lib: '../lib',
        test: '../test'
    },
    shim: {
      'lib/jasmine/jasmine-html': [
        'lib/jasmine/jasmine',
        'lib/source-map'
      ]
    }
});

requirejs(['test/boot_jasmine', 'app/engine_test'],
function(boot_jasmine, engine_test) {
  boot_jasmine.boot();
});
