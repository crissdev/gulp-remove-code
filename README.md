# gulp-remove-code

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![npm version](https://badge.fury.io/js/gulp-remove-code.svg)](https://badge.fury.io/js/gulp-remove-code)
[![Build Status](https://travis-ci.org/crissdev/gulp-remove-code.svg?branch=master)](https://travis-ci.org/crissdev/gulp-remove-code)
[![Build status](https://ci.appveyor.com/api/projects/status/kxeyejflng4v6yjn/branch/master?svg=true&passingText=master%20-%20OK)](https://ci.appveyor.com/project/crissdev/gulp-remove-code/branch/master)
[![Dependency Status](https://david-dm.org/crissdev/gulp-remove-code.svg)](https://david-dm.org/crissdev/gulp-remove-code)

> A [Gulp](https://github.com/gulpjs/gulp) plugin to remove sections of code from files based on conditions


## Install

```sh
npm install gulp-remove-code --save-dev
```

## Usage

```js
const removeCode = require('gulp-remove-code');

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

  <span>Removing code is easy.</span>
</div>
```

```js
const removeCode = require('gulp-remove-code');

gulp.src('./src/file.html')
  .pipe(removeCode({ production: true }))
  .pipe(gulp.dest('./dist'))
```

The plugin will remove the code inside the comments, as well as the comments.


### Remove code JavaScript files

```js
let value = JSON.stringify({key: 'value'});

//removeIf(production)
value = JSON.stringify({key: 'value', production: true}, null, 2);
//endRemoveIf(production)

//removeIf(!development)
value = JSON.stringify({key: 'value', development: false}, null, 2);
//endRemoveIf(!development)

```

```js
const removeCode = require('gulp-remove-code');

gulp.src('./src/file.js')
  .pipe(removeCode({ production: true }))
  .pipe(gulp.dest('./dist'))
```

The plugin will remove the code inside the comments, as well as the comments.


### Advanced usage

Starting with version 2 of this plugin, conditions can also be expressed using the `!` specifier.


```js
// Remove code using *!* (negated) conditions

//----------- gulpfile.js -----------
//
const removeCode = require('gulp-remove-code');

gulp.src('./src/file.js')
  .pipe(removeCode({ production: false }))
  .pipe(gulp.dest('./dist'))


//----------- app-file.js -----------
//
//removeIf(!production)
value = JSON.stringify({key: 'value', production: false}, null, 2);
//endRemoveIf(!production)

```



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

Configure how the end comment is defined.


## License

MIT © [Cristian Trifan](https://crissdev.com)
