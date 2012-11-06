module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: 
		'/*!--------------------- FLYPAPER -------------------------//\n' + 
		' * <%= pkg.name %> - v<%= pkg.version %>\n' +
		' * Author: <%= pkg.author.name %>\n' +
		' * Email: <%= pkg.author.email %>\n' + 
		' * URL: <%= pkg.author.url %>\n' +
        ' * Date: <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;\n' +
        ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> \n */\n' +
		' //--------------------------------------------------------//\n'
   },
    concat: {
      dist: {
        src: [	'<banner:meta.banner>', 
				'<file_strip_banner:src/core/head.js>',
				'<file_strip_banner:src/core/string.js>',
				'<file_strip_banner:src/layers.js>',
				'<file_strip_banner:src/color.js>',
				'<file_strip_banner:src/colorPalette.js>',
				'<file_strip_banner:src/eventCtrlr.js>',
				'<file_strip_banner:src/infoCtrlr.js>',
				'<file_strip_banner:src/PaperTool.js>',
				'<file_strip_banner:src/init.js>',
				'<file_strip_banner:src/math.js>',
				'<file_strip_banner:src/motions/motion.js>',
				'<file_strip_banner:src/motions/scroll.js>',
				'<file_strip_banner:src/motions/bob.js>',
				'<file_strip_banner:src/motions/swing.js>',
				'<file_strip_banner:src/objects/Ananda.js>',
				'<file_strip_banner:src/objects/Pullbar.js>'
			],
        dest: 'dist/<%= pkg.libname %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.libname %>.min.js'
      }
    },
    qunit: {
      files: ['test/test-build.html','test/test-init.html'],
      scratch: ['test/test-scratch.html']
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js', 'test/**/!(scratch).js', 'examples/**/*.js'],
      scratch: ['grunt.js','scratchpad/**/*.js','test/tests/scratch.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
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
        boss: true,
        eqnull: true
      },
      globals: {
        exports: true,
		paper: true,
		fly: true,
        module: false,
		navigator: true,
		window: true,
		document: true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint:files qunit:files concat min');
  grunt.registerTask('dirty', 'lint:files concat');
  grunt.registerTask('scratch', 'lint:files lint:scratch qunit:scratch');
};
