module.exports = function(grunt) {

  var task = grunt.task;
  var file = grunt.file;
  var log = grunt.log;
  var verbose = grunt.verbose;
  var fail = grunt.fail;
  var option = grunt.option;
  var config = grunt.config;
  var template = grunt.template;
  var _ = grunt.util._;



  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    nodeunit: {
      tests: [
        "test/imp.js",
      ]
    },
    jshint: {
      options: {
        latedef: false,
        curly: true,
        eqeqeq: true,
        immed: true,
        newcap: false,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        strict: false,
        esnext: true,
        globals: {
          rewire: true,
          exports: true,
          document: true,
          Promise: true,
          WeakMap: true,
          Map: true,
          window: true,
          IS_TEST_ENV: true
        }
      },
      files: {
        src: [
          "Gruntfile.js",
          "lib/**/*.js",
          "test/**/*.js",
          "eg/**/*.js"
        ]
      }
    },

    jsbeautifier: {
      files: ["lib/**/*.js", "eg/**/*.js", "test/**/*.js"],
      options: {
        js: {
          braceStyle: "collapse",
          breakChainedMethods: false,
          e4x: false,
          evalCode: false,
          indentChar: " ",
          indentLevel: 0,
          indentSize: 2,
          indentWithTabs: false,
          jslintHappy: false,
          keepArrayIndentation: false,
          keepFunctionIndentation: false,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          spaceBeforeConditional: true,
          spaceInParen: false,
          unescapeStrings: false,
          wrapLineLength: 0
        }
      }
    },
    jscs: {
      files: {
        src: [
          "Gruntfile.js",
          "lib/**/!(johnny-five)*.js",
          "test/**/*.js",
          "eg/**/*.js",
          ]
      },
      options: {
        config: ".jscsrc",
        requireCurlyBraces: [
          "if",
          "else",
          "for",
          "while",
          "do",
          "try",
          "catch",
        ],
        disallowNewlineBeforeBlockStatements: true,
        requireSpaceBeforeBlockStatements: true,
        requireParenthesesAroundIIFE: true,
        requireSpacesInConditionalExpression: true,
        // requireSpaceBeforeKeywords: true,
        requireSpaceAfterKeywords: [
          "if", "else",
          "switch", "case",
          "try", "catch",
          "do", "while", "for",
          "return", "typeof", "void",
        ],
        validateQuoteMarks: {
          mark: "\"",
          escape: true
        }
      }
    },
    watch: {
      src: {
        files: [
          "Gruntfile.js",
          "lib/**/*.js",
          "test/**/*.js",
          "eg/**/*.js"
        ],
        tasks: ["default"],
        options: {
          interrupt: true,
        },
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-nodeunit");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jsbeautifier");
  grunt.loadNpmTasks("grunt-jscs");

  grunt.registerTask("default", ["jshint", "jscs", "nodeunit"]);

  // grunt.registerTask("default", ["jshint", "nodeunit"]);
  // grunt.registerTask("default", ["jshint"]);

};
