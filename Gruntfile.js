"use strict";

module.exports = function (grunt) {

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-sass");
  grunt.loadNpmTasks("grunt-scss-lint");

  grunt.initConfig({

    // Watch for changes to auto-run build tasks
    watch: {
      scripts: {
        files: ["app/assets/**/*.js", "Gruntfile.js"],
        tasks: ["jshint", "uglify:all"]
      },
      styles: {
        files: ["app/assets/scss/**/*.{scss,sass}"],
        tasks: ["scsslint", "sass"]
      }
    },

    // Make sure SCSS code quality is decent
    scsslint: {
      allFiles: [
        "app/assets/scss/**/*.{scss,sass}"
      ],
      options: {
        config: ".scss-lint-config.yml",
        reporterOutput: null
      }
    },

    // Lets CSSify our SCSS
    sass: {
      dist:  {
        options: {
          outputStyle: "compressed",
          sourceComments: "map"
        },
        files: {
          "public/stylesheets/style.css" : "app/assets/scss/style.scss"
        }
      }
    },

    // Make sure code style is good for client side resources
    jshint: {
      options: {
        jshintrc: ".jshintrc",
        reporter: require("jshint-stylish")
      },
      all: [
        "Gruntfile.js",
        "app/assets/js/**/*.js",
        "!app/assets/js/vendor/**/*.js"
      ]
    },

    // Concatenate and minify client side js
    uglify: {
      all: {
        options: {
          sourceMap: true,
          sourceMapIncludeSources: true
        },
        files: {
          "public/js/all.min.js": [
            "app/assets/js/**/*.js"
          ]
        }
      }
    }

  });

  grunt.registerTask("dist", [
    "sass",
    "uglify"
  ]);
  grunt.registerTask("build", [
    "scsslint",
    "sass",
    "jshint",
    "uglify"
  ]);
  grunt.registerTask("default", "build");
};
