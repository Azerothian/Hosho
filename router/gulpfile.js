"use strict"; //eslint-disable-line
require("babel-core/register");
const gulp = require("gulp");
const eslint = require("gulp-eslint");
const del = require("del");
const mocha = require("gulp-mocha");
const babel = require("gulp-babel");
// const path = require("path");
const sourceMapSupport = require("source-map-support");
sourceMapSupport.install();
const sourcemaps = require("gulp-sourcemaps");


gulp.task("clean", () => {
  return del(["build/**/*"]);
});

gulp.task("compile", ["lint"], () => {
  return gulp.src(["src/**/*"])
    .pipe(sourcemaps.init({identityMap: true}))
    .pipe(babel({}))
    .pipe(sourcemaps.write(".", {includeContent: true}))
    .pipe(gulp.dest("build/"));
});

gulp.task("lint", ["clean"], () => {
  return gulp.src(["src/**/*.js"])
    .pipe(eslint({
      fix: true,
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


gulp.task("watch", () => {
  gulp.watch("src/**/*.*", ["compile"]);
});

gulp.task("test", () => {
  gulp.src(["build/**/*.test.js"], {read: false})
    .pipe(mocha({
      require: ["source-map-support/register"],
      timeout: 30000,
    }));
});



gulp.task("default", ["compile"]);
