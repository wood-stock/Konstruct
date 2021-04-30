const gulp = require('gulp'); // Подключаем Gulp
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const del = require('del');
const concat = require('gulp-concat');
const imagemin = require("gulp-imagemin");

// Таск для сборки Gulp файлов
gulp.task('pug', function(callback) {
	return gulp.src('./src/pug/pages/**/*.pug')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Pug',
					sound: false,
					message: err.message
				}
			})
		}))
		.pipe( pug({
			pretty: true
		}) )
		.pipe( gulp.dest('./build/') )
		.pipe( browserSync.stream() )
	callback();
});

gulp.task('css-libs', function(){
    return gulp.src([
            'node_modules/normalize.css/normalize.css',
        ])
        .pipe(concat('_libs.scss'))
        .pipe(gulp.dest('src/scss'))
        .pipe(browserSync.reload({stream: true}))
})

// Таск для компиляции SCSS в CSS
gulp.task('scss', function(callback) {
	return gulp.src('./src/scss/main.scss')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Styles',
			        sound: false,
			        message: err.message
				}
			})
		}))
		.pipe( sourcemaps.init() )
		.pipe( sass() )
		.pipe( autoprefixer({
			overrideBrowserslist: ['last 4 versions']
		}) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest('./build/css/') )
		.pipe( browserSync.stream() )
	callback();
});
// Копирование Шрифтов
gulp.task('copy:fonts', function(callback) {
	return gulp.src('./src/fonts/**/*.*')
	  .pipe(gulp.dest('./build/fonts/'))
	callback();
});

// Копирование Изображений
gulp.task('copy:img', function(callback) {
	return gulp.src('./src/img/**/*.*')
	  .pipe(imagemin())
	  .pipe(gulp.dest('./build/img/'))
	callback();
});

// Копирование Скриптов
gulp.task('copy:js', function(callback) {
	return gulp.src('./src/js/**/*.*')
	  .pipe(gulp.dest('./build/js/'))
	callback();
});

// Слежение за HTML и CSS и обновление браузера
gulp.task('watch', function() {

	// Следим за картинками, шрифтами и скриптами и обновляем браузер
	watch( ['./build/js/**/*.*', './build/img/**/*.*', './build/fonts/**/*.*'], gulp.parallel(browserSync.reload) );

	// Запуск слежения и компиляции SCSS с задержкой
	watch('./src/scss/**/*.scss', function(){
		setTimeout( gulp.parallel('scss'), 500 )
	})

	// Слежение за PUG и сборка
	watch('./src/pug/**/*.pug', gulp.parallel('pug'))

	// Следим за картинками, шрифтами и скриптами, и копируем их в build
	watch('./src/fonts/**/*.*', gulp.parallel('copy:fonts'))
	watch('./src/img/**/*.*', gulp.parallel('copy:img'))
	watch('./src/js/**/*.*', gulp.parallel('copy:js'))

});

// Задача для старта сервера из папки app
gulp.task('server', function() {
	browserSync.init({
		server: {
			baseDir: "./build/"
		}
	})
});

gulp.task('clean:build', function() {
	return del('./build')
});

// Дефолтный таск (задача по умолчанию)
// Запускаем одновременно задачи server и watch
gulp.task(
		'default',
		gulp.series(
			gulp.parallel('clean:build'),
			gulp.parallel('css-libs', 'scss', 'pug', 'copy:img', 'copy:js', 'copy:fonts'),
			gulp.parallel('server', 'watch'),
			)
	);
