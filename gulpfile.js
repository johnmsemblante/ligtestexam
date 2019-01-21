/* Admin Gulp Tasker Version: 2.0 ------------------------------------------ */
/*                                                                           */
/* IMPORTANT: Please install all dependencies by running:                    */
/* "$ npm install" : Installs all required node modules                      */
/* "$ bower install" : Installs all required project dependencies            */
/*                                                                           */
/* In addition, you can update your project dependencies by running:         */
/* "$ bower update" : Installs all required project dependencies             */
/*                                                                           */
/* The following tasks are available to you after dependency intallation:    */
/* gulp : Spools up a server for static HTML files                           */
/* gulp --proxy [yourproject.dev] : Proxy against your build against your    */
/*                                  local Wordpress project.                 */
/* ------------------------------------------------------------------------- */

/* Imports Node Modules ---------------------------------------------------- */
var autoprefix = require('gulp-autoprefixer'),
		bump = require('gulp-bump'),
		cleanCSS = require('gulp-clean-css'),
		critical = require('critical'),
		dateFormat = require('dateformat'),
		argv = require('yargs').argv,
		bootlint = require('gulp-bootlint'),
		browserSync = require('browser-sync').create(),
		concat = require('gulp-concat'),
		gulp = require('gulp'),
		htmlInjector = require('bs-html-injector'),
		w3cjs = require('gulp-w3cjs'),
		through2 = require('through2'),
		imagemin = require('gulp-imagemin'),
		jshint = require('gulp-jshint'),
		plumber = require('gulp-plumber'),
		rimraf = require('gulp-rimraf'),
		pump = require('pump'),
		rename = require('gulp-rename'),
		sass = require('gulp-sass'),
		sourcemaps = require('gulp-sourcemaps'),
		stylish = require('jshint-stylish'),
		uglify = require('gulp-uglify'),
		utils = require('gulp-util');

/* Clean Tasks ------------------------------------------------------------- */
gulp.task('clean', ['clean:js', 'clean:css']);

gulp.task('clean:js', function() {
	return gulp.src(['js'], {
		read: false
	})
	.pipe(rimraf());
});

gulp.task('clean:css', function() {
	return gulp.src(['css'], {
		read: false
	})
	.pipe(rimraf());
});

/* Images Task ------------------------------------------------------------- */
gulp.task('images', function() {
	return gulp.src('./images/**/*')
		.pipe(imagemin({
			optimizationLevel: 3,
			progressive: true,
			interlaced: true,
			multipass: true
		}))
		.pipe(gulp.dest('./images'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

/* JavaScript Task --------------------------------------------------------- */
function process_javascript(scripts, destination) {
	return gulp.src(scripts)
		.pipe(plumber(function(error) {
			utils.log(utils.colors.red(error.message));
			this.emit('end');
		}))
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.pipe(concat(destination))
		.pipe(gulp.dest('./js'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(uglify())
		.pipe(gulp.dest('./js'));
}

gulp.task('javascript', ['clean:js'], function() {
	var scripts = [
		'libs/bootstrap/dist/js/bootstrap.min.js',
		'libs/chocolat/dist/js/jquery.chocolat.min.js',
		'libs/slick-carousel/slick/slick.min.js',
		'libs/matchHeight/jquery.matchHeight.js',
		'libs/jquery.stellar/jquery.stellar.min.js',
		'libs/jssocials/dist/jssocials.min.js',
		'libs/jquery-ias/src/callbacks.js',
		'libs/jquery-ias/src/extension/trigger.js',
		'libs/jquery-ias/src/extension/spinner.js',
		'libs/jquery-ias/src/extension/paging.js',
		'libs/jquery-ias/src/extension/noneleft.js',
		'libs/jquery-ias/src/extension/history.js',
		'libs/jquery-ias/src/jquery-ias.js',
		'libs/fancybox/source/jquery.fancybox.js',
		'libs/fancybox/source/helpers/jquery.fancybox-media.js',
		'js/jquery-ias.js',
		'src/js/scripts.js'
	];

	return process_javascript(scripts, 'scripts.js');
});

/* Sass Task --------------------------------------------------------------- */
gulp.task('sass', ['clean:css'], function() {
	return gulp.src('src/scss/**/*.scss')
		.pipe(plumber(function(error) {
			utils.log(utils.colors.red(error.message));
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'nested'
		}))
		.pipe(autoprefix())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./css'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('./css'))
		.pipe(browserSync.stream({
			match: '**/*.css'
		}));
});

/* Bootlint Task --------------------------------------------------------------- */
gulp.task('bootlint', function() {
	return gulp.src('./_html/*.html')
		.pipe(bootlint({
			stoponerror: true,
			stoponwarning: true,
			loglevel: 'debug',
			disabledIds: ['W009', 'E007'],
			reportFn: function(file, lint, isError, isWarning, errorLocation) {
				var message = (isError) ? 'ERROR! - ' : 'WARN! - ';
				if (errorLocation) {
					message += file.path + ' (line:' + (errorLocation.line + 1) + ', col:' + (errorLocation.column + 1)
						+ ') [' + lint.id + '] ' + lint.message;
				} else {
					message += file.path + ': ' + lint.id + ' ' + lint.message;
				}
				utils.log(utils.colors.red(message));
			},
			summaryReportFn: function(file, errorCount, warningCount) {
				if (errorCount > 0 || warningCount > 0) {
					console.log('please fix the ' + errorCount + ' errors and ' + warningCount + ' warnings in ' + file.path);
				} else {
					console.log('No problems found in ' + file.path);
				}
			}
		}));
});

gulp.task('w3c', function () {
	gulp.src('./_html/*.html')
		.pipe(w3cjs())
		.pipe(through2.obj(function(file, enc, cb){
			cb(null, file);
			if (!file.w3cjs.success){
				console.log('HTML validation error(s) found');
			}
		}));
});

require('gulp').task('perf-tool', function () {
	var options = {
		siteURL:'http://www.google.com',
		sitePages: ['/']
	};

	return require('devbridge-perf-tool').performance(options);
});

require('gulp').task('critical', function () {
	return critical.generate({
		inline: true,
		base: '_html/',
		src: 'index.html',
		dest: '_html/index-critical.html',
		minify: true,
		ignore: ['@font-face',/url\(/],
    dimensions: [{
        height: 768,
        width: 1024
    }, {
        height: 768,
        width: 1366
    }]
	});
});

gulp.task('bump', function() {
	var now = new Date();
	var version = dateFormat(now, 'yyyy.mm.dd');
	var regex = "([\'|\"]?version[\'|\"]?[ ]*[:=][ ]*[\'|\"]?)(\\d+.\\d+.\\d+)(-[0-9A-Za-z\.-]+)?([\'|\"]?)";

	RegExp.escape = function( value ) {
     return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	}

	regex = new RegExp(regex, 'gi');
	regex.escape;

  gulp.src(['./bower.json', './package.json', './style.css'])
  .pipe(bump({
  	regex: regex,
  	version: version
  }))
  .pipe(gulp.dest('./'));
});

/* Default Gulp Task ------------------------------------------------------- */
gulp.task('default', function() {
	gulp.start('javascript');
	gulp.start('sass');
	//gulp.start('images');
	gulp.start(['bump']);

	gulp.watch('src/js/**/*.js', ['javascript']);
	gulp.watch('src/scss/**/*.scss', ['sass']);
	gulp.watch('_html/*.html', ['bootlint']);

	browserSync.use(htmlInjector, {
		files: './_html/**/*.html'
	});

	var browserSync_args = {
		logFileChanges: false,
		injectChanges: true,
		port: 8010
	}

	if (argv.proxy) {
		browserSync_args.proxy = argv.proxy;
	} else {
		browserSync_args.server = {
			baseDir: './',
			directory: true
		}
	}

	if (argv.host) {
		browserSync_args.host = argv.host;
	}

	browserSync.init(browserSync_args);
});
