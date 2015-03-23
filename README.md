#[gulp](https://github.com/gulpjs/gulp)-remove-code

[![npm version](https://badge.fury.io/js/gulp-remove-code.svg)](http://badge.fury.io/js/gulp-remove-code)
[![Build Status](https://travis-ci.org/crissdev/gulp-remove-code.svg?branch=master)](https://travis-ci.org/crissdev/gulp-remove-code)
[![Dependency Status](https://david-dm.org/crissdev/gulp-remove-code.svg)](https://david-dm.org/crissdev/gulp-remove-code)

> A [Gulp](https://github.com/gulpjs/gulp) plugin to remove sections of code from files based on conditions


## Install

```sh
npm install --save-dev gulp-remove-code
```

## Usage

```js
var removeCode = require('gulp-remove-code');

gulp.src('./src/*.js')
  .pipe(removeCode({ noDevFeatures: true }))
  .pipe(gulp.dest('./dist/'))

gulp.src('./src/*.js')
  .pipe(removeCode({ noDevFeatures: true, commentStart: '/*', commentEnd: '*/' }))
  .pipe(gulp.dest('./dist/'))

gulp.src('./src/*.coffee')
  .pipe(removeCode({ noDevFeatures: true }))
  .pipe(gulp.dest('./dist/'))
```

## Examples

### Remove code from HTML files

```html
<div>
  <!--removeIf(production)-->
  <div class="sandbox-banner">Running in sandbox environment</div>
  <!--endRemoveIf(production)-->

  <span>Removing code is ready.</span>
</div>
```

```js
var removeCode = require('gulp-remove-code');

gulp.src('./src/file.html')
  .pipe(removeCode({ production: true }))
  .pipe(gulp.dest('./dist'))
```

The plugin will remove the code inside the comments, as well as the comments.


### Remove code JavaScript files

```js
var value = JSON.stringify({key: 'value'});

//removeIf(production)
value = JSON.stringify({key: 'value'}, null, 2);
//endRemoveIf(production)
```

```js
var removeCode = require('gulp-remove-code');

gulp.src('./src/file.js')
  .pipe(removeCode({ production: true }))
  .pipe(gulp.dest('./dist'))
```

The plugin will remove the code inside the comments, as well as the comments.


## API

### removeCode([options])

### options

Type: `Object`

A key value pair map to specify what code should be removed. The truthy values will remove the code.


#### options.commentStart

Type: `String`

Default: `Detected from file extension. Use // as fallback.`

Configure how the start comment is defined.


#### options.commentEnd

Type: `String`

Default: `Detected from file extension. Use empty as fallback.`

Configure how the start comment is defined.


## License

MIT © [Cristian Trifan](http://crissdev.com)
