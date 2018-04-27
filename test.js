'use strict'

const removeCode = require('./index.js')
const File = require('vinyl')
const fs = require('fs')
const es = require('event-stream')
const assert = require('assert')

describe('gulp-remove-code', function () {
  let emptyFile
  let nullFile
  let coffeeFile
  let htmlFile
  let cshtmlFile
  let jadeFile
  let jsFile
  let srcFile
  let spacesFile

  let notCoffeeFile
  let notHtmlFile
  let notCshtmlFile
  let notJadeFile
  let notJsFile
  let notSrcFile
  let notSpacesFile

  function readFixtureAsText (name) {
    return fs.readFileSync('test/fixtures/' + name).toString()
  }

  describe('in buffer mode', function () {
    beforeEach(function () {
      emptyFile = new File({
        path: 'test/fixtures/empty',
        contents: Buffer.from('')
      })
      nullFile = new File({
        contents: null
      })

      htmlFile = new File({
        path: 'test/fixtures/file-before.html',
        contents: fs.readFileSync('test/fixtures/file-before.html')
      })
      cshtmlFile = new File({
        path: 'test/fixtures/file-before.cshtml',
        contents: fs.readFileSync('test/fixtures/file-before.cshtml')
      })
      coffeeFile = new File({
        path: 'test/fixtures/file-before.coffee',
        contents: fs.readFileSync('test/fixtures/file-before.coffee')
      })
      jadeFile = new File({
        path: 'test/fixtures/file-before.jade',
        contents: fs.readFileSync('test/fixtures/file-before.jade')
      })
      jsFile = new File({
        path: 'test/fixtures/file-before.js',
        contents: fs.readFileSync('test/fixtures/file-before.js')
      })
      srcFile = new File({
        path: 'text/fixtures/file-before.src',
        contents: fs.readFileSync('test/fixtures/file-before.src')
      })
      spacesFile = new File({
        path: 'text/fixtures/spaces-before.src',
        contents: fs.readFileSync('test/fixtures/spaces-before.src')
      })

      notHtmlFile = new File({
        path: 'test/fixtures/not-file-before.html',
        contents: fs.readFileSync('test/fixtures/not-file-before.html')
      })
      notCshtmlFile = new File({
        path: 'test/fixtures/not-file-before.cshtml',
        contents: fs.readFileSync('test/fixtures/not-file-before.cshtml')
      })
      notCoffeeFile = new File({
        path: 'test/fixtures/not-file-before.coffee',
        contents: fs.readFileSync('test/fixtures/not-file-before.coffee')
      })
      notJadeFile = new File({
        path: 'test/fixtures/not-file-before.jade',
        contents: fs.readFileSync('test/fixtures/not-file-before.jade')
      })
      notJsFile = new File({
        path: 'test/fixtures/not-file-before.js',
        contents: fs.readFileSync('test/fixtures/not-file-before.js')
      })
      notSrcFile = new File({
        path: 'text/fixtures/not-file-before.src',
        contents: fs.readFileSync('test/fixtures/not-file-before.src')
      })
      notSpacesFile = new File({
        path: 'text/fixtures/not-spaces-before.src',
        contents: fs.readFileSync('test/fixtures/not-spaces-before.src')
      })
    })

    it('should do nothing when contents is null', function (done) {
      const stream = removeCode()

      stream.once('data', function (file) {
        assert.strictEqual(file.isNull(), true)
        done()
      })

      stream.write(nullFile)
      stream.end()
    })

    it('should do nothing when contents is empty', function (done) {
      const stream = removeCode()

      stream.once('data', function (file) {
        assert.strictEqual(file.contents.toString(), '')
        done()
      })

      stream.write(emptyFile)
      stream.end()
    })

    it('should remove code from html file when condition is true', function (done) {
      const stream = removeCode({'no-message': true})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('file-after.html'))
        done()
      })

      stream.write(htmlFile)
      stream.end()
    })

    it('should not remove code from html file when condition is false', function (done) {
      const stream = removeCode({'no-message': false})
      const originalContents = htmlFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(htmlFile)
      stream.end()
    })

    it('should remove code from cshtml file when condition is true', function (done) {
      const stream = removeCode({'no-message': true})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('file-after.cshtml'))
        done()
      })

      stream.write(cshtmlFile)
      stream.end()
    })

    it('should not remove code from cshtml file when condition is false', function (done) {
      const stream = removeCode({'no-message': false})
      const originalContents = cshtmlFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(cshtmlFile)
      stream.end()
    })

    it('should remove code from coffee file when condition is true', function (done) {
      const stream = removeCode({'production': true})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('file-after.coffee'))
        done()
      })

      stream.write(coffeeFile)
      stream.end()
    })

    it('should not remove code from coffee file when condition is false', function (done) {
      const stream = removeCode({'production': false})
      const originalContents = coffeeFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(coffeeFile)
      stream.end()
    })

    it('should remove code from jade file when condition is true', function (done) {
      const stream = removeCode({development: true})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('file-after.jade'))
        done()
      })

      stream.write(jadeFile)
      stream.end()
    })

    it('should not remove code from jade file when condition is false', function (done) {
      const stream = removeCode({development: false})
      const originalContents = jadeFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(jadeFile)
      stream.end()
    })

    it('should remove code from js file when condition is true', function (done) {
      const stream = removeCode({production: true, demo: true})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('file-after.js'))
        done()
      })

      stream.write(jsFile)
      stream.end()
    })

    it('should not remove code from js file when condition is false', function (done) {
      const stream = removeCode({production: false, demo: false})
      const originalContents = jsFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(jsFile)
      stream.end()
    })

    it('should remove code from custom file when condition is true', function (done) {
      const stream = removeCode({development: true, commentStart: '/#', commentEnd: '#/'})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('file-after.src'))
        done()
      })

      stream.write(srcFile)
      stream.end()
    })

    it('should not remove code from custom file when condition is false', function (done) {
      const stream = removeCode({development: false, commentStart: '/#', commentEnd: '#/'})
      const originalContents = srcFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(srcFile)
      stream.end()
    })

    it('should allow space between commentStart/commendEnd and removal start/end tag', function (done) {
      const stream = removeCode({development: true, commentStart: '/#', commentEnd: '#/'})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('spaces-after.src'))
        done()
      })

      stream.write(spacesFile)
      stream.end()
    })

    it('should remove code from php file when condition is true', done => {
      const stream = removeCode({
        development: true,
        commentStart: ['/*', '//', '<!--', '<?php /*'],
        commentEnd: ['*/', '', '-->', '*/ ?>']
      })
      stream.once('data', file => {
        assert.equal(file.contents.toString(), '')
        done()
      })

      stream.write(htmlFile = new File({
        path: 'file.php',
        contents: Buffer.from(`<!DOCTYPE html>
<div>
      <!-- removeIf(development) -->secret_html<!--endRemoveIf(development)-->
<span>public</span>
      <?php /* removeIf(development) */ ?>secret_php<?php /* endRemoveIf(development) */ ?>
<span>public</span>
      <script>
          // removeIf(development)
          let secret_js = 1;
          // endRemoveIf(development)
          let public = 2;
          
          /* removeIf(development) */
          let secret_js = 3;
          /* endRemoveIf(development) */
      </script>
<span>public</span>
</div>
`)
      }))
      stream.end()
    })

    /* not */

    it('should remove code from html file when not condition is true', function (done) {
      const stream = removeCode({'no-message': false})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('not-file-after.html'))
        done()
      })

      stream.write(notHtmlFile)
      stream.end()
    })

    it('should not remove code from html file when not condition is false', function (done) {
      const stream = removeCode({'no-message': true})
      const originalContents = notHtmlFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(notHtmlFile)
      stream.end()
    })

    it('should remove code from cshtml file when not condition is true', function (done) {
      const stream = removeCode({'no-message': false})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('not-file-after.cshtml'))
        done()
      })

      stream.write(notCshtmlFile)
      stream.end()
    })

    it('should not remove code from cshtml file when not condition is false', function (done) {
      const stream = removeCode({'no-message': true})
      const originalContents = notCshtmlFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(notCshtmlFile)
      stream.end()
    })

    it('should remove code from coffee file when not condition is true', function (done) {
      const stream = removeCode({'production': false})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('not-file-after.coffee'))
        done()
      })

      stream.write(notCoffeeFile)
      stream.end()
    })

    it('should not remove code from coffee file when not condition is false', function (done) {
      const stream = removeCode({'production': true})
      const originalContents = notCoffeeFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(notCoffeeFile)
      stream.end()
    })

    it('should remove code from jade file when not condition is true', function (done) {
      const stream = removeCode({development: false})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('not-file-after.jade'))
        done()
      })

      stream.write(notJadeFile)
      stream.end()
    })

    it('should not remove code from jade file when not condition is false', function (done) {
      const stream = removeCode({development: true})
      const originalContents = notJadeFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(notJadeFile)
      stream.end()
    })

    it('should remove code from js file when not condition is true', function (done) {
      const stream = removeCode({production: false, demo: false})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('not-file-after.js'))
        done()
      })

      stream.write(notJsFile)
      stream.end()
    })

    it('should not remove code from js file when not condition is false', function (done) {
      const stream = removeCode({production: true, demo: true})
      const originalContents = notJsFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(notJsFile)
      stream.end()
    })

    it('should remove code from custom file when not condition is true', function (done) {
      const stream = removeCode({development: false, commentStart: '/#', commentEnd: '#/'})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('not-file-after.src'))
        done()
      })

      stream.write(notSrcFile)
      stream.end()
    })

    it('should not remove code from custom file when not condition is false', function (done) {
      const stream = removeCode({development: true, commentStart: '/#', commentEnd: '#/'})
      const originalContents = notSrcFile.contents.toString()

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), originalContents)
        done()
      })

      stream.write(notSrcFile)
      stream.end()
    })

    it('should allow space between commentStart/commendEnd and removal start/end tag', function (done) {
      const stream = removeCode({development: false, commentStart: '/#', commentEnd: '#/'})

      stream.once('data', function (file) {
        assert.equal(file.contents.toString(), readFixtureAsText('not-spaces-after.src'))
        done()
      })

      stream.write(notSpacesFile)
      stream.end()
    })
  })

  describe('in stream mode', function () {
    beforeEach(function () {
      emptyFile = new File({
        path: 'test/empty',
        contents: fs.createReadStream('test/fixtures/empty')
      })
      nullFile = new File({
        path: 'test/fixtures/file-before.html',
        contents: null
      })

      htmlFile = new File({
        path: 'test/fixtures/file-before.html',
        contents: fs.createReadStream('test/fixtures/file-before.html')
      })
      cshtmlFile = new File({
        path: 'test/fixtures/file-before.cshtml',
        contents: fs.createReadStream('test/fixtures/file-before.cshtml')
      })
      coffeeFile = new File({
        path: 'test/fixtures/file-before.coffee',
        contents: fs.createReadStream('test/fixtures/file-before.coffee')
      })
      jadeFile = new File({
        path: 'test/fixtures/file-before.jade',
        contents: fs.createReadStream('test/fixtures/file-before.jade')
      })
      jsFile = new File({
        path: 'test/fixtures/file-before.js',
        contents: fs.createReadStream('test/fixtures/file-before.js')
      })
      srcFile = new File({
        path: 'test/fixtures/file-before.src',
        contents: fs.createReadStream('test/fixtures/file-before.src')
      })
      spacesFile = new File({
        path: 'test/fixtures/spaces-before.src',
        contents: fs.createReadStream('test/fixtures/spaces-before.src')
      })

      notHtmlFile = new File({
        path: 'test/fixtures/not-file-before.html',
        contents: fs.createReadStream('test/fixtures/not-file-before.html')
      })
      notCshtmlFile = new File({
        path: 'test/fixtures/not-file-before.cshtml',
        contents: fs.createReadStream('test/fixtures/not-file-before.cshtml')
      })
      notCoffeeFile = new File({
        path: 'test/fixtures/not-file-before.coffee',
        contents: fs.createReadStream('test/fixtures/not-file-before.coffee')
      })
      notJadeFile = new File({
        path: 'test/fixtures/not-file-before.jade',
        contents: fs.createReadStream('test/fixtures/not-file-before.jade')
      })
      notJsFile = new File({
        path: 'test/fixtures/not-file-before.js',
        contents: fs.createReadStream('test/fixtures/not-file-before.js')
      })
      notSrcFile = new File({
        path: 'test/fixtures/not-file-before.src',
        contents: fs.createReadStream('test/fixtures/not-file-before.src')
      })
      notSpacesFile = new File({
        path: 'test/fixtures/not-spaces-before.src',
        contents: fs.createReadStream('test/fixtures/not-spaces-before.src')
      })
    })

    it('should do nothing when contents is empty', function (done) {
      const stream = removeCode()

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.strictEqual(data.toString(), '')
          done()
        }))
      })

      stream.write(emptyFile)
      stream.end()
    })

    it('should remove code from html file when condition is true', function (done) {
      const stream = removeCode({'no-message': true})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('file-after.html'))
          done()
        }))
      })

      stream.write(htmlFile)
      stream.end()
    })

    it('should not remove code from html file when condition is false', function (done) {
      const stream = removeCode({'no-message': false})
      const originalContents = readFixtureAsText('file-before.html')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(htmlFile)
      stream.end()
    })

    it('should remove code from cshtml file when condition is true', function (done) {
      const stream = removeCode({'no-message': true})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('file-after.cshtml'))
          done()
        }))
      })

      stream.write(cshtmlFile)
      stream.end()
    })

    it('should not remove code from cshtml file when condition is false', function (done) {
      const stream = removeCode({'no-message': false})
      const originalContents = readFixtureAsText('file-before.cshtml')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(cshtmlFile)
      stream.end()
    })

    it('should remove code from coffee file when condition is true', function (done) {
      const stream = removeCode({'production': true})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('file-after.coffee'))
          done()
        }))
      })

      stream.write(coffeeFile)
      stream.end()
    })

    it('should not remove code from coffee file when condition is false', function (done) {
      const stream = removeCode({'production': false})
      const originalContents = readFixtureAsText('file-before.coffee')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(coffeeFile)
      stream.end()
    })

    it('should remove code from jade file when condition is true', function (done) {
      const stream = removeCode({development: true})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('file-after.jade'))
          done()
        }))
      })

      stream.write(jadeFile)
      stream.end()
    })

    it('should not remove code from jade file when condition is false', function (done) {
      const stream = removeCode({development: false})
      const originalContents = readFixtureAsText('file-before.jade')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(jadeFile)
      stream.end()
    })

    it('should remove code from js file when condition is true', function (done) {
      const stream = removeCode({production: true, demo: true})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('file-after.js'))
          done()
        }))
      })

      stream.write(jsFile)
      stream.end()
    })

    it('should not remove code from js file when condition is false', function (done) {
      const stream = removeCode({production: false, demo: false})
      const originalContents = readFixtureAsText('file-before.js')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(jsFile)
      stream.end()
    })

    it('should remove code from custom file when condition is true', function (done) {
      const stream = removeCode({development: true, commentStart: '/#', commentEnd: '#/'})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('file-after.src'))
          done()
        }))
      })

      stream.write(srcFile)
      stream.end()
    })

    it('should not remove code from custom file when condition is false', function (done) {
      const stream = removeCode({development: false, commentStart: '/#', commentEnd: '#/'})
      const originalContents = readFixtureAsText('file-before.src')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(srcFile)
      stream.end()
    })

    it('should allow space between commentStart/commendEnd and removal start/end tag', function (done) {
      const stream = removeCode({development: true, commentStart: '/#', commentEnd: '#/'})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('spaces-after.src'))
          done()
        }))
      })

      stream.write(spacesFile)
      stream.end()
    })

    /* not */

    it('should remove code from html file when not condition is true', function (done) {
      const stream = removeCode({'no-message': false})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('not-file-after.html'))
          done()
        }))
      })

      stream.write(notHtmlFile)
      stream.end()
    })

    it('should not remove code from html file when not condition is false', function (done) {
      const stream = removeCode({'no-message': true})
      const originalContents = readFixtureAsText('not-file-before.html')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(notHtmlFile)
      stream.end()
    })

    it('should remove code from cshtml file when not condition is true', function (done) {
      const stream = removeCode({'no-message': false})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('not-file-after.cshtml'))
          done()
        }))
      })

      stream.write(notCshtmlFile)
      stream.end()
    })

    it('should not remove code from cshtml file when not condition is false', function (done) {
      const stream = removeCode({'no-message': true})
      const originalContents = readFixtureAsText('not-file-before.cshtml')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(notCshtmlFile)
      stream.end()
    })

    it('should remove code from coffee file when not condition is true', function (done) {
      const stream = removeCode({'production': false})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('not-file-after.coffee'))
          done()
        }))
      })

      stream.write(notCoffeeFile)
      stream.end()
    })

    it('should not remove code from coffee file when not condition is false', function (done) {
      const stream = removeCode({'production': true})
      const originalContents = readFixtureAsText('not-file-before.coffee')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(notCoffeeFile)
      stream.end()
    })

    it('should remove code from jade file when not condition is true', function (done) {
      const stream = removeCode({development: false})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('not-file-after.jade'))
          done()
        }))
      })

      stream.write(notJadeFile)
      stream.end()
    })

    it('should not remove code from jade file when not condition is false', function (done) {
      const stream = removeCode({development: true})
      const originalContents = readFixtureAsText('not-file-before.jade')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(notJadeFile)
      stream.end()
    })

    it('should remove code from js file when not condition is true', function (done) {
      const stream = removeCode({production: false, demo: false})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('not-file-after.js'))
          done()
        }))
      })

      stream.write(notJsFile)
      stream.end()
    })

    it('should not remove code from js file when not condition is false', function (done) {
      const stream = removeCode({production: true, demo: true})
      const originalContents = readFixtureAsText('not-file-before.js')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(notJsFile)
      stream.end()
    })

    it('should remove code from custom file when not condition is true', function (done) {
      const stream = removeCode({development: false, commentStart: '/#', commentEnd: '#/'})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('not-file-after.src'))
          done()
        }))
      })

      stream.write(notSrcFile)
      stream.end()
    })

    it('should not remove code from custom file when not condition is false', function (done) {
      const stream = removeCode({development: true, commentStart: '/#', commentEnd: '#/'})
      const originalContents = readFixtureAsText('not-file-before.src')

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), originalContents)
          done()
        }))
      })

      stream.write(notSrcFile)
      stream.end()
    })

    it('should allow space between commentStart/commendEnd and removal start/end tag', function (done) {
      const stream = removeCode({development: false, commentStart: '/#', commentEnd: '#/'})

      stream.once('data', function (file) {
        file.contents.pipe(es.wait(function (_, data) {
          assert.equal(data.toString(), readFixtureAsText('not-spaces-after.src'))
          done()
        }))
      })

      stream.write(notSpacesFile)
      stream.end()
    })
  })
})
