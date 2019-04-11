var gulp = require('gulp');


var config = {
    src: './src/**'
}

gulp.task('copy', function () {
    gulp.src(config.src)
        .pipe(gulp.dest('./demo/h5-demo'))
        .pipe(gulp.dest('./demo/react-demo/src'))
        .pipe(gulp.dest('./demo/vue-demo/src'))
});

// Rerun the task when a file changes
gulp.task('watch', function () {
    gulp.watch(config.src, ['copy']);
});

gulp.task('default', ['copy', 'watch']);
