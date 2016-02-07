/*global module:false*/
var path = require("path");

module.exports = function(grunt) {
  /* require('load-grunt-tasks')(grunt); */
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015', 'react']
      },
      es5: {
        files: [{
          cwd: 'www/js',
          src: ['app/**/*.js', 'app.js', 'lib-es6/**/*.js'],
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
        }]
      },
      dist: {
        files: [{
          cwd: 'www/',
          expand: true,
          src: ['index.html', 'tests.html'],
          dest: 'build/dist/'
        }]
      }
    },

    /* r.js, for distribution */
    requirejs: {
      compile: {
        options: {
          baseUrl: "build/es5/js/lib",
          mainConfigFile: "build/es5/js/app.js",
          name: 'app',
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
    eslint: {
      lint: {
        options: {
          configFile: '.eslintrc',
        },
        files: {
          src: ['www/js/app/**/*.js', 'www/js/app/**/*.jsx', 'www/js/test/**/*.js']
        }
      }
    },
    watch: {
      scripts: {
        files: ['www/css/**/*.css', 'www/js/app/**/*.js'],
        tasks: ['es5']
      }
    }

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-babel');

  // build es5 version into build/es5 (for devel); this incorporates jsx
  // compilation and babel (es6 -> es5) transpilation.
  grunt.registerTask('es5', ['babel', 'copy:es5']);
  // build minified and concatenated into build/dist (for distribution) using r.js
  grunt.registerTask('dist', ['es5', 'copy:dist', 'requirejs']);
};
