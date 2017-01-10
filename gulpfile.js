/* ================
// Required Plugins
// ============= */

var gulp = require('gulp'),
    packageJSON = require('./package.json'),
    configuration = require('./configuration.json'),
    browserSync = require('browser-sync').create(),
    minimist = require('minimist'),
    gulpif = require('gulp-if'),
    cached = require('gulp-cached'),
    changed = require('gulp-changed'),
    pug = require('gulp-pug'),
    pugInheritance = require('gulp-pug-inheritance'),
    postcss = require('gulp-postcss'),
    cssnano = require('gulp-cssnano'),
    extReplace = require('gulp-ext-replace'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    svgSprite = require('gulp-svg-sprite'),
    ghPages = require('gulp-gh-pages'),
    surge = require('gulp-surge');


/* ================
// Setup Environment
// ============= */

var site = 'dist/';

var base = './' + site,
    min = '',
    production = false;

var options = minimist(process.argv.slice(2));

if (options.base) base = './';
if (options.min) min = '.min';
if (options.production) production = true;


/* ================
// Compile Pug
// ============= */

gulp.task('pug', function() {

  return gulp.src('src/pug/pages/**/*.pug')
    .pipe(changed(site, {
      extension: '.html'
    }))
    .pipe(cached('pug'))
    .pipe(pugInheritance({
      basedir: 'src/pug/pages',
      skip: 'node_modules'
    }))
    .pipe(pug({
      locals: {
        siteTitle: packageJSON.name,
        siteDescription: packageJSON.description,
        siteLinks: configuration.links,
        base: base,
        min: min
      },
      pretty: true
    }))
    .pipe(gulp.dest('./'))
    .pipe(gulpif(production, gulp.dest(site)))
    .pipe(browserSync.stream());

});


/* ================
// Compile Postcss
// ============= */

gulp.task('postcss', function() {

  return gulp.src('src/postcss/site.css')
    .pipe(postcss([
      require('postcss-easy-import')({
        glob: true
      }),
      require('postcss-mixins'),
      require('postcss-nested'),
      require('postcss-simple-grid')({
        separator: '-'
      }),
      require('postcss-simple-vars')({
        variables: configuration
      }),
      require('postcss-functions')({
        functions: {
          em: function(value, context) {
            if(context == null) {
              context = configuration.bodySize;
            }
            var emValue = value / context;
            return emValue + 'em';
          },
          rem: function(value) {
            var emValue = value / 16;
            return emValue + 'rem';
          },
          nu: function(value, context) {
            if(context == null) {
              context = configuration.bodySize;
            }
            var nuValue = value / context;
            return nuValue;
          }
        }
      }),
      require('autoprefixer')({
        browsers: ['> 1%'],
        cascade: false
      }),
      require('postcss-discard-empty')
    ]))
    .pipe(gulp.dest(site + 'css'))
    .pipe(browserSync.stream())
    .pipe(gulpif(production, cssnano()))
    .pipe(gulpif(production, extReplace('.min.css')))
    .pipe(gulpif(production, gulp.dest(site + 'css')))
    .pipe(gulpif(production, browserSync.stream()));

});


/* ================
// Compile JS
// ============= */

gulp.task('js', function() {

  return gulp.src([
    'src/js/vendor/*.js',
    'src/js/mimo/*.js',
    'src/js/site/*.js'
  ])
    .pipe(concat('site.js'))
    .pipe(gulp.dest(site + 'js'))
    .pipe(browserSync.stream())
    .pipe(gulpif(production, uglify({
      mangle: false
    })))
    .pipe(gulpif(production, extReplace('.min.js')))
    .pipe(gulpif(production, gulp.dest(site + 'js')))
    .pipe(gulpif(production, browserSync.stream()));

});


/* ================
// Optimize Images
// ============= */

gulp.task('images', function() {

  return gulp.src('src/images/*')
    .pipe(changed(site + 'images'))
    .pipe(imagemin())
    .pipe(gulp.dest(site + 'images'))
    .pipe(browserSync.stream());

});


/* ================
// Create Sprite
// ============= */

gulp.task('sprite', function() {

  return gulp.src('src/svg/*.svg')
    .pipe(svgSprite({
      mode: {
        inline: true,
        symbol: {
          dest: site
        }
      },
      svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false,
        dimensionAttributes: false
      }
    }))
    .pipe(gulp.dest('.'))
    .pipe(browserSync.stream());

});


/* ================
// Sync Changes
// ============= */

gulp.task('browser-sync', function() {

  browserSync.init({
    logPrefix: packageJSON.name,
    ui: false,
    server: './',
    notify: {
      styles: {
        top: 'auto',
        bottom: '0',
        padding: '4px',
        fontSize: '12px',
        borderBottomLeftRadius: '0'
      }
    }
  });

});


/* ================
// Github Pages Deployment
// ============= */

gulp.task('ghPages', ['build'], function() {

  return gulp.src('./dist/**/*')
    .pipe(ghPages());

});


/* ================
// Surge Direct Deployment
// ============= */

gulp.task('surge', ['build'], function() {

  return surge({
    project: './dist/',
    domain: 'mimogear.surge.sh'
  });

});


/* ================
// Watch Files
// ============= */

gulp.task('watch', function() {

  gulp.watch('src/pug/template.pug', ['pug']);
  gulp.watch('src/pug/**/*.pug', ['pug']);
  gulp.watch('src/postcss/**/*.css', ['postcss']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/images/*', ['images']);
  gulp.watch('src/svg/*', ['sprite']);

});


/* ================
// Gulp Task Sets
// ============= */

gulp.task('build', [
  'images',
  'sprite',
  'postcss',
  'js',
  'pug'
]);

gulp.task('default', [
  'build',
  'watch',
  'browser-sync'
]);
