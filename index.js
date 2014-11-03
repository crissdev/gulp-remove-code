'use strict';

var gutil = require('gulp-util'),
    es = require('event-stream'),
    BufferStreams = require('bufferstreams'),
    extname = require('path').extname,
    regexCache = {};

module.exports = function(options) {
    options = options || {};

    var conditions = [],
        commentEnd = '',
        commentStart;       // not set means autodetect

    Object.keys(options).forEach(function(key) {
        if (key === 'commentStart') {
            commentStart = options.commentStart;
        }
        else if (key === 'commentEnd') {
            if (commentStart) {
                // set it only if commentStart is provided
                commentEnd = options.commentEnd;
            }
            else {
                gutil.log(gutil.colors.yellow('gulp-remove-code: commentStart was not set but commentEnd provided. ' +
                    'The option will be ignored. commentEnd: ' + commentEnd));
            }
        }
        else if (options[key]) {
            conditions.push(key);
        }
    });

    return es.map(function(file, callback) {
        var fileExt = (file.path ? extname(file.path).substr(1).toLowerCase() : '');
        if (file.isNull()) {
            // Nothing to do if no contents
            callback(null, file);
        }
        else if (file.isStream()) {
            file.contents = file.contents.pipe(new BufferStreams(function(err, buf, cb) {
                try {
                    if (err) {
                        return cb(new gutil.PluginError('gulp-remove-code', err.message));
                    }
                    cb(null, applyReplacements(buf, fileExt, commentStart, commentEnd, conditions));
                }
                catch (err) {
                    cb(new gutil.PluginError('gulp-remove-code', err.message));
                }
            }));
            callback(null, file);
        }
        else if (file.isBuffer()) {
            try {
                file.contents = applyReplacements(file.contents, fileExt, commentStart, commentEnd, conditions);
                callback(null, file);
            }
            catch (err) {
                callback(err, null);
            }
        }
    });
};

function applyReplacements(buffer, fileExt, commentStart, commentEnd, conditions) {
    if (!commentStart) {
        switch (fileExt) {
            case 'coffee':
                commentStart = '#';
                commentEnd = '';
                break;
            case 'css':
                commentStart = '/*';
                commentEnd = '*/';
                break;
            case 'html':
                commentStart = '<!--';
                commentEnd = '-->';
                break;
            case 'jade':
                commentStart = '//-';
                commentEnd = '';
                break;
            default:
                commentStart = '//';
                commentEnd = '';
                break;
        }
    }

    var contents = buffer.toString('utf8');

    if (contents.length > 0) {
        for (var i = 0; i < conditions.length; i++) {
            var key = conditions[i],
                regex = regexCache[fileExt + key];

            if (!regex) {
                regex = regexCache[fileExt + key] = getRemovalTagsRegExp(commentStart, commentEnd, key);
            }
            contents = contents.replace(regex, '');
        }
    }
    return new Buffer(contents);
}

function escapeForRegExp(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function getRemovalTagsRegExp(commentStart, commentEnd, key) {
    return new RegExp('(' +
        escapeForRegExp(commentStart) + '\\s*' + escapeForRegExp('removeIf(' + key + ')') + '\\s*' + escapeForRegExp(commentEnd) + '\\s*' +
        '(\\n|\\r|.)*?' +
        escapeForRegExp(commentStart) + '\\s*' + escapeForRegExp('endRemoveIf(' + key + ')') + '\\s*' + escapeForRegExp(commentEnd) + ')',
        'gi');
}
