var gulp = require('gulp');
var html2tpl = require('./test1.js');
gulp.task('html2tpl',function(){
    gulp.src('./test/src/**/*.html',{buffer:false})
    .pipe(html2tpl('testdist.js',{src:'test/src'}))
    .pipe(gulp.dest('test/dist'))
});