"use strict";

var gulp = require("gulp");
var stylus = require("gulp-stylus");
var stylint = require("gulp-stylint");
var jshint = require("gulp-jshint");
var rename = require("gulp-rename");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var jscs = require("gulp-jscs");
var concat = require("gulp-concat");
var util = require("gulp-util");

var notify;
var useNotifications = process.env.GULP_ENV !== "build";

if (useNotifications) {
  notify = require("gulp-notify");
}

var sourcePaths = {
  browserifyStart: "./app/assets/js/bootstrap.js",
  clientScripts: "./app/assets/js/**/*.js",
  vendorScripts: "./app/assets/js/vendor/**/*.js",
  js: "{app,config,lib,test}/**/*.js",
  stylus: "./app/assets/stylus/**/*.styl",
  stylusStart: "./app/assets/stylus/style.styl"
};

var destPaths = {
  scripts: "./public/js/",
  stylus: "./public/stylesheets/"
};

var getBundleName = function () {
  var version = require("./package.json").version;
  var name = require("./package.json").name;
  return name + "." + version;
};

function errorHandler(err) {
  /*jshint validthis:true */
  util.log(util.colors.red("Error:"), err.message);
  this.emit("end");
}

function vendorScriptsTask() {
  return gulp.src(sourcePaths.vendorScripts)
    .pipe(concat("vendor.js"))
    .pipe(gulp.dest(destPaths.scripts))
    .pipe(rename({suffix: ".min"}))
    .pipe(uglify())
    .pipe(gulp.dest(destPaths.scripts));
}

function styleSheetsTask() {
  return gulp.src(sourcePaths.stylusStart)
    .pipe(sourcemaps.init())
    .pipe(stylus({ compress: true }))
    .on("error", errorHandler)
    .pipe(rename({suffix: ".min"}))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(destPaths.stylus));
}

function browserifyTask() {
  var bundler = browserify({
    entries: [sourcePaths.browserifyStart],
    debug: true
  });

  var bundle = function () {
    return bundler
      .bundle()
      .on("error", errorHandler)
      .pipe(source(getBundleName() + ".js"))
      .pipe(buffer())
      .pipe(gulp.dest(destPaths.scripts))
      .pipe(rename({suffix: ".min"}))
      .pipe(uglify())
      .pipe(gulp.dest(destPaths.scripts));
  };

  return bundle();
}

gulp.task("jshint", function () {
  return gulp.src(sourcePaths.js)
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail"));
});

gulp.task("jscs", function () {
  return gulp.src(sourcePaths.js)
    .pipe(jscs());
});

gulp.task("stylint", function () {
  return gulp.src(sourcePaths.stylus)
    .pipe(stylint());
});

gulp.task("vendorscripts", function () {
  if (useNotifications) {
    return vendorScriptsTask()
      .pipe(notify({message: "Vendor scripts task completed"}));
  } else {
    return vendorScriptsTask();
  }
});

gulp.task("browserify", ["jshint", "jscs"], function () {
  if (useNotifications) {
    return browserifyTask()
      .pipe(notify({ message: "Scripts task completed", onLast: true }));
  } else {
    return browserifyTask();
  }
});

gulp.task("stylesheets", function () {
  if (useNotifications) {
    return styleSheetsTask()
      .pipe(notify({ message: "Stylesheets task completed", onLast: true }));
  } else {
    return styleSheetsTask();
  }
});

gulp.task("watch", function () {
  gulp.watch(sourcePaths.js, ["jscs", "jshint"]);
  gulp.watch(sourcePaths.clientScripts, ["browserify"]);
  gulp.watch(sourcePaths.vendorScripts, ["vendorscripts"]);
  gulp.watch(sourcePaths.stylus, ["stylesheets", "stylint"]);
});

gulp.task("dist", ["stylesheets", "browserify", "vendorscripts"]);

gulp.task("default", ["watch", "dist", "stylint"]);
