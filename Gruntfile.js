/*global module:false*/
/*global __dirname:false*/
var path = require("path");

module.exports = function(grunt) {
  var traceurRuntime = "node_modules/traceur/bin/traceur-runtime.js";

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    react: {
      gui: {
        files: [{
          expand: true,
          cwd: 'www/js',
          src: ['app/**/*.jsx'],
          dest: 'build/es5/js',
          ext: '.js'
        }]
      }
    },

    traceur: {
      options: {
        traceurOptions: "--experimental --source-maps",
        traceurCommand: path.resolve(path.join(__dirname, 
          "node_modules/traceur/src/node/command.js"))
      },
      es5: {
        files: [{
          cwd: 'www/js',
          src: ['app/**/*.js', 'app.js', 'test/**/*.js'],
          dest: 'build/es5/js',
          expand: true
        }]
      }
    },

    copy: {
      es5: {
        files: [{
          expand: true, 
          cwd: 'www/js',
          src: ['lib/**/*.js'],
          dest: 'build/es5/js'
        }, {
          cwd: 'www/',
          expand: true,
          src: ['index.html', 'tests.html', 'css/**/*.css'],
          dest: 'build/es5/'
        }, { 
          // copy user traceur into libs
          flatten: true,
          expand: true,
          src: [traceurRuntime],
          dest: 'build/es5/js/lib/'
        }]
      },
      dist: {
        files: [{
          cwd: 'www/',
          expand: true,
          src: ['index.html', 'tests.html'],
          dest: 'build/dist/'
        }, {
          expand: true,
          flatten: true,
          src: traceurRuntime,
          dest: 'build/dist/js/lib/'
        }]
      }
    },

    /* r.js, for distribution */
    requirejs: {
      compile: {
        options: {
          baseUrl: "build/es5/js/app",
          mainConfigFile: "build/es5/js/app.js",
          name: "app",
          paths: {
              lib: '../lib',
              app: '../app',
              requireLib: '../lib/require'
          },
          out: "build/dist/js/app.js",
          include: 'requireLib'
        }
      }
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true,
          require: true,
          define: true,
          /* jasmine */
          describe: true,
          it: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    watch: {
      scripts: {
        files: ['www/**'],
        tasks: ['es5']
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks("grunt-traceur-simple");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks('grunt-react');

  // valis tasks.
  //
  // build es5 version into build/es5 (for devel); this corporates jsx
  // compilation and traceur (es6 -> es5) transpilation.
  grunt.registerTask('es5', ['react:gui', 'jshint', 'traceur', 'copy:es5']);
  // build minified and concatenated into build/dist using r.js
  grunt.registerTask('dist', ['es5',  'copy:dist', 'requirejs']);
};
