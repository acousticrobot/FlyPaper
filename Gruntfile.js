module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        stripBanners: true,
        banner:
        '/**\n * <%= pkg.name %> --v<%= pkg.version %>\n *\n' +
        ' * Date <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' +
        ' * @author <%= pkg.author.name %>\n' +
        ' * @email <%= pkg.author.email %>\n' +
        ' * <%= pkg.author.url %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' * @Copyright (C) <%= grunt.template.today("yyyy") %>\n' +
        ' * @Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n *\n' +
        ' * @version <%= pkg.version %>-<%= grunt.template.today("yymmddHHMMss") %>\n' +
        ' * @namespace fly  \n*/\n\n\n'
      },
      dist: {
        src: [
          'src/core/head.js',
          'src/core/string.js',
          'src/core/info.js',
          'src/core/event.js',
          'src/core/base.js',
          'src/eventCtrlr.js',
          'src/layers.js',
          'src/color.js',
          'src/colorUtil.js',
          'src/colorSets.js',
          'src/colorPalette.js',
          'src/infoCtrlr.js',
          'src/paperTool.js',
          'src/init.js',
          'src/math.js',
          'src/motions/motion.js',
          'src/motions/scroll.js',
          'src/motions/bob.js',
          'src/motions/swing.js',
          'src/objects/Ananda.js',
          'src/objects/Pullbar.js'
        ],
        dest: 'dist/<%= pkg.libname %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.libname %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      files: ['gruntfile.js', 'src/**/*.js', 'test/**/*.js', 'examples/**/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        forin: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        trailing: true,
        undef: true,
        boss: false,
        eqnull: true,
        globals: {
          exports: true,
          paper: true,
          fly: true,
          module: false,
          navigator: true,
          window: true,
          document: true
        }
      }
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: ['dist/'],
          outdir: 'docs-yui'
        }
      }
    },
    jsdoc : {
        dist : {
            src: 'dist/flypaper.js',
            dest: 'docs'
        }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-contrib-jsdoc');

  grunt.registerTask('test', ['jshint', 'qunit']);

  grunt.registerTask('ydocs', ['yuidoc']);
  grunt.registerTask('jdocs', ['jsdoc']);

  grunt.registerTask('build-only', ['concat']);

  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);

};