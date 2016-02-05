requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app',
        lib: '../lib'
    },
    shim: {
        filesaver: {
            exports: 'filesaver'
        }
    }
});

requirejs(['lib/jquery', 'app/gui/main'],
function($, gui) {
  gui.init(); 
});
