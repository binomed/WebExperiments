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

gulp.task('serve',  ['less'], function(){
  browserSync.init({
    server:'./'
  });
  gulp.watch("less/**/*.less", ['less']);
  gulp.watch("./**/*.html").on('change', reload);
  gulp.watch("./javascript/**/*.js", ['browserify']);
  gulp.watch("./bundle.js").on('change', reload);
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
    .pipe(browserify({
      insertGlobals : true
    }))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./'));
});

/* Default task */
gulp.task("default", ["serve"]);