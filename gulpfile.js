var gulp = require('gulp');
var webserver = require('gulp-webserver');
var shell = require('gulp-shell')
var optimist = require('optimist');
var http = require('http');
var filePath = optimist.argv.p;

gulp.task('webserver', function() {
    gulp.src('react')
        .pipe(webserver({
            host: '127.0.0.1',
            port: 8082,
            middleware: function(req, res, next) {
                var url = 'http://127.0.0.1:8081/example' + (filePath ? '/' + filePath : '') + req.url;
                http.get(url, function(resp) {
                    resp.pipe(res);
                }).on('error', function(e) {
                    next();
                });

            }
        }));
});

gulp.task('ios', shell.task(['/usr/local/bin/react-native run-ios']));

gulp.task('adr', shell.task(['/usr/local/bin/react-native run-android']));

gulp.task('run', ['webserver']);

gulp.task('all', ['run', process.platform == 'darwin' ? 'ios' : 'adr']);
