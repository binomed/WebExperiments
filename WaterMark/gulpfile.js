"use strict";
// Include gulp
var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps")
var path = require("path");
var browserSync = require("browser-sync").create();
var less = require("gulp-less");
var browserify = require("gulp-browserify");
var rename = require("gulp-rename");
var reload = browserSync.reload;

gulp.task('serve',  ['browserify','less'], function(){
  browserSync.init({
    server:'./',
  });
  gulp.watch("less/**/*.less", ['less']);
  gulp.watch("./**/*.html").on('change', reload);
  gulp.watch("./javascript/**/*.js", ['browserify']);
  gulp.watch("./lib/waterjef/*.js", ['browserify']);
  gulp.watch("./bundle.js").on('change', reload);
  gulp.watch("./bundle_phone.js").on('change', reload);
});

gulp.task('less',function(){
  return gulp.src('less/**/*.less')
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./css'))
    .pipe(reload({stream:true}));
});

gulp.task('browserify',function(){
  gulp.src('./javascript/main.js')
    .pipe(sourcemaps.init())
    .pipe(browserify({
      insertGlobals : true
    }))
    .pipe(sourcemaps.write())
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./'));
  gulp.src('./javascript/main_phone.js')
    .pipe(sourcemaps.init())
    .pipe(browserify({
      insertGlobals : true
    }))
    .pipe(sourcemaps.write())
    .pipe(rename('bundle_phone.js'))
    .pipe(gulp.dest('./'));
});

/* Default task */
gulp.task("default", ["serve"]);