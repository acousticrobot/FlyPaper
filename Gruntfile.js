module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        stripBanners: true,
        banner:
        '/**\n * <%= pkg.name %> --v <%= pkg.version %> <%= pkg.dev_stage %>\n *\n' +
        ' * Date <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n *\n' +
        ' * @name flypaper\n' +
        ' * @author <%= pkg.author.name %>\n' +
        ' * @email <%= pkg.author.email %>}\n' +
        ' * {@linkplain <%= pkg.author.url %>}\n' +
        '<%= pkg.homepage ? " * {@linkplain " + pkg.homepage + "}\\n" : "" %>' +
        ' * @Copyright (C) <%= grunt.template.today("yyyy") %>\n' +
        ' * @License <%= _.pluck(pkg.licenses, "type").join(", ") %>\n *\n' +
        ' */\n\n\n'
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
          ok: true,
          navigator: true,
          window: true,
          document: true
        }
      }
    },
    clean: {
      docs: ['docs']
    },
    jsdoc : {
        dist : {
            src: ['README.md','dist/flypaper.js'],
            dest: 'docs',
            options: {
              configure: 'jsdocs_conf.json'
            }
        }
    },
    bump: {
      patch: {
        options: {part: 'patch'},
        src: [ 'package.json' ]
      },
      build: {
        options: {part: 'build'},
        src: [ 'package.json' ]
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    },
    exec: {
      tag: {
        cmd: function() {
          var pkg = grunt.file.readJSON('package.json');
          return 'git tag ' + pkg.version; }
      },
      commit: {
         cmd: function() {
          var d = new Date().toUTCString();
          return 'git add . ; git commit -a -m "' + d + '"';
          }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-bumpx');
  grunt.loadNpmTasks('grunt-exec');


  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('jsdocs', ['jsdoc']);
  grunt.registerTask('build-only', ['concat']);
  grunt.registerTask('test', ['jshint','qunit']);
  grunt.registerTask('default', ['clean', 'jshint', 'qunit', 'bump:build', 'concat', 'jsdoc']);
  grunt.registerTask('build', ['clean', 'jshint', 'qunit', 'bump:build', 'concat', 'uglify', 'jsdoc', 'exec:commit', 'exec:tag' ]);

};
