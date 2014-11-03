'use strict';
/*global describe:false,beforeEach:false,it:false*/

var removeCode = require('../'),
    gutil = require('gulp-util'),
    File = gutil.File,
    fs = require('fs'),
    es = require('event-stream');

require('should');
require('mocha');


describe('gulp-remove-code', function() {

    var emptyFile,
        coffeeFile,
        nullFile,
        htmlFile,
        jadeFile,
        jsFile,
        srcFile;

    function readFixtureAsText(name) {
        return fs.readFileSync('test/fixtures/' + name).toString('utf8');
    }

    describe('in buffer mode', function() {

        beforeEach(function() {
            emptyFile = new File({
                path: 'test/fixtures/empty',
                contents: new Buffer('')
            });
            htmlFile = new File({
                path: 'test/fixtures/file-before.html',
                contents: fs.readFileSync('test/fixtures/file-before.html')
            });
            nullFile = new File({
                contents: null
            });
            coffeeFile = new File({
                path: 'test/fixtures/file-before.coffee',
                contents: fs.readFileSync('test/fixtures/file-before.coffee')
            });
            jadeFile = new File({
                path: 'test/fixtures/file-before.jade',
                contents: fs.readFileSync('test/fixtures/file-before.jade')
            });
            jsFile = new File({
                path: 'test/fixtures/file-before.js',
                contents: fs.readFileSync('test/fixtures/file-before.js')
            });
            srcFile = new File({
                path: 'text/fixtures/file-before.src',
                contents: fs.readFileSync('test/fixtures/file-before.src')
            });
        });

        it('should do nothing when contents is null', function(done) {
            var stream = removeCode();

            stream.once('data', function(file) {
                file.isNull().should.equal(true);
                done();
            });

            stream.write(nullFile);
            stream.end();
        });

        it('should do nothing when contents is empty', function(done) {
            var stream = removeCode();

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('');
                done();
            });

            stream.write(emptyFile);
            stream.end();
        });

        it('should remove code from html file when condition is true', function(done) {
            var stream = removeCode({'no-message': true});

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal(readFixtureAsText('file-after.html'));
                done();
            });

            stream.write(htmlFile);
            stream.end();
        });

        it('should not remove code from html file when condition is false', function(done) {
            var stream = removeCode({'no-message': false}),
                originalContents = htmlFile.contents.toString('utf8');

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal(originalContents);
                done();
            });

            stream.write(htmlFile);
            stream.end();
        });

        it('should remove code from coffee file when condition is true', function(done) {
            var stream = removeCode({'production': true});

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal(readFixtureAsText('file-after.coffee'));
                done();
            });

            stream.write(coffeeFile);
            stream.end();
        });

        it('should not remove code from coffee file when condition is false', function(done) {
            var stream = removeCode({'production': false}),
                originalContents = coffeeFile.contents.toString('utf8');

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal(originalContents);
                done();
            });

            stream.write(coffeeFile);
            stream.end();
        });

        it('should remove code from jade file when condition is true', function(done) {
            var stream = removeCode({development:true});

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal(readFixtureAsText('file-after.jade'));
                done();
            });

            stream.write(jadeFile);
            stream.end();
        });

        it('should not remove code from jade file when condition is false', function(done) {
            var stream = removeCode({development:false}),
                originalContents = jadeFile.contents.toString('utf8');

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal(originalContents);
                done();
            });

            stream.write(jadeFile);
            stream.end();
        });

        it('should remove code from js file when condition is true', function(done) {
            var stream = removeCode({production: true, demo: true});

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal(readFixtureAsText('file-after.js'));
                done();
            });

            stream.write(jsFile);
            stream.end();
        });

        it('should not remove code from js file when condition is false', function(done) {
            var stream = removeCode({production: false, demo: false}),
                originalContents = jsFile.contents.toString('utf8');

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal(originalContents);
                done();
            });

            stream.write(jsFile);
            stream.end();
        });

        it('should remove code from custom file when condition is true', function(done) {
            var stream = removeCode({development: true, commentStart: '/#', commentEnd: '#/'});

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal(readFixtureAsText('file-after.src'));
                done();
            });

            stream.write(srcFile);
            stream.end();
        });

        it('should not remove code from custom file when condition is false', function(done) {
            var stream = removeCode({development: false, commentStart: '/#', commentEnd: '#/'}),
                originalContents = srcFile.contents.toString('utf8');

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal(originalContents);
                done();
            });

            stream.write(srcFile);
            stream.end();
        });
    });

    describe('in stream mode', function() {
        beforeEach(function() {
            emptyFile = new File({
                path: 'test/empty',
                contents: fs.createReadStream('test/fixtures/empty')
            });
            htmlFile = new File({
                path: 'test/fixtures/file-before.html',
                contents: fs.createReadStream('test/fixtures/file-before.html')
            });
            nullFile = new File({
                path: 'test/fixtures/file-before.html',
                contents: null
            });
            coffeeFile = new File({
                path: 'test/fixtures/file-before.coffee',
                contents: fs.createReadStream('test/fixtures/file-before.coffee')
            });
            jadeFile = new File({
                path: 'test/fixtures/file-before.jade',
                contents: fs.createReadStream('test/fixtures/file-before.jade')
            });
            jsFile = new File({
                path: 'test/fixtures/file-before.js',
                contents: fs.createReadStream('test/fixtures/file-before.js')
            });
            srcFile = new File({
                path: 'test/fixtures/file-before.src',
                contents: fs.createReadStream('test/fixtures/file-before.src')
            });
        });

        it('should do nothing when contents is empty', function(done) {
            var stream = removeCode();

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('');
                    done();
                }));
            });

            stream.write(emptyFile);
            stream.end();
        });

        it('should remove code from html file when condition is true', function(done) {
            var stream = removeCode({'no-message': true});

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal(readFixtureAsText('file-after.html'));
                    done();
                }));
            });

            stream.write(htmlFile);
            stream.end();
        });

        it('should not remove code from html file when condition is false', function(done) {
            var stream = removeCode({'no-message': false}),
                originalContents = readFixtureAsText('file-before.html');

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal(originalContents);
                    done();
                }));
            });

            stream.write(htmlFile);
            stream.end();
        });

        it('should remove code from coffee file when condition is true', function(done) {
            var stream = removeCode({'production': true});

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal(readFixtureAsText('file-after.coffee'));
                    done();
                }));
            });

            stream.write(coffeeFile);
            stream.end();
        });

        it('should not remove code from coffee file when condition is false', function(done) {
            var stream = removeCode({'production': false}),
                originalContents = readFixtureAsText('file-before.coffee');

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal(originalContents);
                    done();
                }));
            });

            stream.write(coffeeFile);
            stream.end();
        });

        it('should remove code from jade file when condition is true', function(done) {
            var stream = removeCode({development:true});

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal(readFixtureAsText('file-after.jade'));
                    done();
                }));
            });

            stream.write(jadeFile);
            stream.end();
        });

        it('should not remove code from jade file when condition is false', function(done) {
            var stream = removeCode({development:false}),
                originalContents = readFixtureAsText('file-before.jade');

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal(originalContents);
                    done();
                }));
            });

            stream.write(jadeFile);
            stream.end();
        });

        it('should remove code from js file when condition is true', function(done) {
            var stream = removeCode({production: true, demo: true});

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal(readFixtureAsText('file-after.js'));
                    done();
                }));
            });

            stream.write(jsFile);
            stream.end();
        });

        it('should not remove code from js file when condition is false', function(done) {
            var stream = removeCode({production: false, demo: false}),
                originalContents = readFixtureAsText('file-before.js');

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal(originalContents);
                    done();
                }));
            });

            stream.write(jsFile);
            stream.end();
        });

        it('should remove code from custom file when condition is true', function(done) {
            var stream = removeCode({development: true, commentStart: '/#', commentEnd: '#/'});

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal(readFixtureAsText('file-after.src'));
                    done();
                }));
            });

            stream.write(srcFile);
            stream.end();
        });

        it('should not remove code from custom file when condition is false', function(done) {
            var stream = removeCode({development: false, commentStart: '/#', commentEnd: '#/'}),
                originalContents = readFixtureAsText('file-before.src');

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal(originalContents);
                    done();
                }));
            });

            stream.write(srcFile);
            stream.end();
        });
    });

});
