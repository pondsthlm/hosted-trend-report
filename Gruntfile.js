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

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: ".jshintrc",
        reporter: require("jshint-stylish")
      },
      all: [
        "Gruntfile.js",
        "app/assets/**/*.js"
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
        }
      }
    }

  });

  grunt.registerTask("dist", [
    "sass",
    "uglify:all"
  ]);
  grunt.registerTask("build", [
    "scsslint",
    "sass",
    "jshint",
    "uglify:all"
  ]);
  grunt.registerTask("default", "build");
};

