/**
 * Created by taksenov on 15.02.2014.
 *
 * после скачивания нового проекта с гита пишем: npm install
 * затем пишем: bower install
 *
 * ----------------------------------------
 * используемые команды                  --
 * ----------------------------------------
 * gulp bower          -- подставляет нужные css и js файлы в html файлы в папке app
 * gulp connect        -- локальный сервер для лайврелоада
 * gulp                -- запускает локальный сервер и следит за изменениями в файлах
 *
 * -----------------------------------------------------------------------------
 * gulp less           -- СБОРКА НА ПРОДАКШЕН! Шаг 1 компилируем из LESS в CSS
 * gulp css            -- СБОРКА НА ПРОДАКШЕН! Шаг 2 собираем файл app-custom.css
 * gulp buildhtml      -- СБОРКА НА ПРОДАКШЕН! Шаг 3 собираем весь проект и клаедем его в каталог dist
 * gulp buildhtmlmin   -- С Минификацией! СБОРКА НА ПРОДАКШЕН! Шаг 3 собираем весь проект и клаедем его в каталог dist
 * gulp copystatic     -- СБОРКА НА ПРОДАКШЕН! Шаг 4 копируем статику в каталог dist
 * gulp copyfancybox   -- СБОРКА НА ПРОДАКШЕН! Шаг 5 копируем саппорт файлы fancybox в каталог dist/css
 * КОСТЫЛЬ: сделай замену путей "../../../../../img/" на "../img/" в файле custom.css
 * -----------------------------------------------------------------------------
 *
 * gulp clean      -- чистим папку dist, вслучае пересборки проекта
 * ----------------------------------------
 *
 */
'use strict';

var gulp         = require('gulp'),
    livereload   = require('gulp-livereload'),
    clean        = require('gulp-clean'),
    connect      = require('gulp-connect'),
    useref       = require('gulp-useref'),
    gulpif       = require('gulp-if'),
    concatCSS    = require('gulp-concat-css'),
    notify       = require('gulp-notify'),
    rename       = require('gulp-rename'),
    minifyCSS    = require('gulp-minify-css'),
    minifyJS     = require('gulp-jsmin'),
    concatJS     = require('gulp-concat'),
    uglify       = require('gulp-uglify'),
    less         = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    wiredep      = require('wiredep').stream;
var path         = require('path');
var combiner     = require('stream-combiner2');

// компиляция из LESS в CSS
gulp.task('less', function () {
    gulp.src('./app/less/main.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('./app/less-compilation'))
        .pipe(notify('LESS compilation -- All done!'));
});

// обработка основных CSS
gulp.task('css', function () {
    gulp.src([
              './app/less-compilation/*.css'
              ])
        .pipe(concatCSS('app-custom.css'))
        .pipe(gulp.dest('./app/css'))
        .pipe(notify('Css -- All done!'));
});

// ============================================================
// компиляция из LESS в CSS
gulp.task('less', function () {
    gulp.src('./app/less/main2.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('./app/less-compilation'))
        .pipe(notify('LESS compilation -- All done!'));
});

// обработка основных CSS
gulp.task('css', function () {
    gulp.src([
              './app/less-compilation/*.css'
              ])
        .pipe(concatCSS('app-custom.css'))
        .pipe(gulp.dest('./app/css'))
        .pipe(notify('Css -- All done!'));
});
// ================================================================


// -- используется в особых случаях для полуавтоматической обработки -------------
// обработка CSS под ie8
//gulp.task('ie8Css', function () {
//    gulp.src('./css/ie8support/ie8main.css')
//        .pipe(concatCSS('ie8bundle.css'))
//        .pipe(minifyCSS())
//        .pipe(rename('ie8bundle.min.css'))
//        .pipe(gulp.dest('./app/css/ie8support'))
//        .pipe(notify('ie8Css -- All done!'));
//});

// обработка JS-файлов
// минификация и конкатенация JS
// обязательное условие подключить сначала jquery
// а потом bootstrap
//gulp.task('js', function() {
//    gulp.src([
//              './dev/js/jquery*.js',
//              './dev/js/bootstrap.js',
//              './dev/js/*.js',
//              './dev/js/common.js',
//              '!./dev/js/vendors/*.min.js',
//              '!./dev/js/less-1.7.4.min.js'
//             ])
//        .pipe(uglify())
//        .pipe(concatJS('bundle.min.js'))
//        .pipe(gulp.dest('./app/js'))
//        .pipe(notify('JS -- All done!'));
//});
// -- используется в особых случаях для полуавтоматической обработки -------------

// -- bower wiredep
gulp.task('bower', function () {
  gulp.src('./app/*.html')
    .pipe(wiredep({
        directory : 'app/bower_components'
    }))
    .pipe(gulp.dest('app'));
});
// -- wiredep

// livereload -- перезагрузка страницы при изменении ---------------
// запуск локального фронтэнд сервера
gulp.task('connect', function() {
    connect.server({
        root: 'app',
        livereload: true
        //port: 55555
    });
});

// следим за изменением -- html
gulp.task('htmledit', function () {
  gulp.src('./app/*.html')
    .pipe(connect.reload());
});

// следим за изменением -- less
gulp.task('lessedit', function () {
    gulp.src('./app/less/*.less')
        .pipe(connect.reload());
});

// следим за изменением -- css
gulp.task('cssedit', function () {
    gulp.src('./app/css/*.css')
        .pipe(connect.reload())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }));
});

// следим за изменением -- js
gulp.task('jsedit', function () {
    gulp.src('./app/js/*.js')
        .pipe(connect.reload());
});

// вотчер
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('./app/*.html').on('change', livereload.changed);
    gulp.watch('./app/less/*.less').on('change', livereload.changed);
    gulp.watch('./app/css/*.css').on('change', livereload.changed);
    gulp.watch('./app/js/*.js').on('change', livereload.changed);
});
// livereload -- перезагрузка страницы при изменении ---------------

// -- сборка проекта -----------------------------------------------
gulp.task('buildhtml', function () {
    var assets = useref.assets();

    return gulp.src('app/*.html')
        .pipe(assets)
        //.pipe(gulpif('*.js', uglify()))
        //.pipe(gulpif('*.css', minifyCSS()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('buildhtmlmin', function () {
    var assets = useref.assets();

    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCSS()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});
// -- сборка проекта -----------------------------------------------

// -- копирование дополнительных файлов ----------------------------
gulp.task('copystatic', ['staticprepareImg', 'staticprepareFonts'], function () {
    return gulp.src('./app/static/**/*.*')
        .pipe(gulp.dest('./dist/'));
});
// копируем статику в папку static Img
gulp.task('staticprepareImg', function () {
    return gulp.src('./app/img/**/*.*')
        .pipe(gulp.dest('./app/static/img/'));
});
// копируем статику в папку static Fonts
gulp.task('staticprepareFonts', function () {
    return gulp.src('./app/fonts/**/*.*')
        .pipe(gulp.dest('./app/static/fonts/'));
});

gulp.task('copyfancybox', function () {
    return gulp.src([
            './app/css/fancybox/source/*.gif',
            './app/css/fancybox/source/*.png',
            '!./app/css/fancybox/source/*.css',
            '!./app/css/fancybox/source/*.js'
        ])
        .pipe(gulp.dest('./dist/css/'));
});
// -- копирование дополнительных файлов ----------------------------

// Очистка папки dist
gulp.task('clean', function () {
    return gulp.src('dist', {read: false}).pipe(clean());
});

// таск галпа, запускает только локальный сервер с лайврелоадом
gulp.task('default', [
                        'connect',
                        'htmledit',
                        'lessedit',
                        'cssedit',
                        'watch',
                        'jsedit'
                    ]);
