'use strict';

var gulp        = require('gulp');
var	gutil       = require('gulp-util');
var	eslint      = require('gulp-eslint');
var	sass        = require('gulp-sass');
var cleanCSS    = require('gulp-clean-css');
var htmlclean   = require('gulp-htmlclean');
var image       = require('gulp-image');
var	babel       = require('gulp-babel');
var	sourcemaps  = require('gulp-sourcemaps');
var	concat      = require('gulp-concat');
var	uglify      = require('gulp-uglify');
var	browserSync = require('browser-sync').create();
var	del         = require('del');
var Server      = require('karma').Server;
var nodemon     = require('gulp-nodemon');

var source = {
	html: 'source/*.html',
	js: 'source/js/*.js',
	scss: 'source/scss/**/*.scss',
	img: ['source/img/*.{png,gif,jpg}', 'source/img/projects/*.{png,gif,jpg}', 'source/*.ico']
};

var dest = {
	root: 'public',
	js: 'public/js',
	css: 'public/css',
	img: 'public/img'
};

gulp.task('default', ['build-dev']);
gulp.task('build-dev', ['html', 'sass', 'js', 'img']);
gulp.task('build-prod', ['html-prod', 'sass-prod', 'js-prod', 'img-prod'])

gulp.task('clean', function() {
	return del([dest.root]);
});

gulp.task('eslint', function() {
	return gulp.src(source.js)
		.pipe(eslint({
			"extends": "eslint:recommended",
			"env": {
				"browser": true
			},
			"parserOptions": {
						"ecmaVersion": 6,
						"sourceType": "module",
						"ecmaFeatures": {
						"jsx": true
					}
			},
			"rules": {
				"semi": 2
			}
		}))
		.pipe(eslint.format());
});

gulp.task('js',function() {
	return gulp.src(source.js)
		.pipe(sourcemaps.init())
			.pipe(babel({
				presets: ['es2015']
			}))
			.pipe(concat('bundle.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(dest.js))
		.pipe(browserSync.stream());
});

gulp.task('js-prod',function() {
	return gulp.src(source.js)
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(concat('bundle.js'))
		.pipe(uglify())
		.pipe(gulp.dest(dest.js))
		.pipe(browserSync.stream());
});

gulp.task('sass', function() {
	return gulp.src(source.scss)
		.pipe(sourcemaps.init())
			.pipe(sass())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(dest.css))
		.pipe(browserSync.stream());
});

gulp.task('sass-prod', function() {
	return gulp.src(source.scss)
		.pipe(sass())
		.pipe(cleanCSS())
		.pipe(gulp.dest(dest.css))
		.pipe(browserSync.stream());
});

gulp.task('html', function() {
	return gulp.src(source.html)
		.pipe(gulp.dest(dest.root))
		.pipe(browserSync.stream());
});

gulp.task('html-prod', function() {
	return gulp.src(source.html)
		.pipe(htmlclean())
		.pipe(gulp.dest(dest.root))
		.pipe(browserSync.stream());
});

gulp.task('img', function() {
	return gulp.src(source.img)
		.pipe(gulp.dest(dest.img))
		.pipe(browserSync.stream());
});

gulp.task('img-prod', function() {
	return gulp.src(source.img)
		.pipe(image({
			jpegRecompress: false,
			jpegoptim: true
		}))
		.pipe(gulp.dest(dest.img))
		.pipe(browserSync.stream());
});

gulp.task('serve', ['build-dev', 'nodemon'], function () {

    browserSync.init(null, {
        proxy: "http://localhost:4000"
    });

    gulp.watch(source.scss, ['sass']);
    gulp.watch(source.js, ['js']);
    gulp.watch(source.html, ['html']);
    gulp.watch(source.img, ['img']);
});

gulp.task('serve:prod', ['build-prod', 'nodemon-prod'], function () {

    browserSync.init(null, {
        proxy: "http://localhost:4000"
    });

    gulp.watch(source.scss, ['sass-prod']);
    gulp.watch(source.js, ['js-prod']);
    gulp.watch(source.html, ['html-prod']);
    gulp.watch(source.img, ['img-prod']);
});

gulp.task('nodemon', function () {
    nodemon({ 
        script: 'server.js',
        watch: ['server.js', 'source/js/app.js']
    });
});

gulp.task('nodemon-prod', function () {
    nodemon({ 
        script: 'server.js',
        watch: ['server.js', 'source/js/app.js'],
        env: { 'NODE_ENV': 'production'}
    });
});

gulp.task('test', function (done) {
	new Server({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done).start();
});

gulp.task('tdd', function (done) {
	new Server({
		configFile: __dirname + '/karma.conf.js'
	}, done).start();
});
