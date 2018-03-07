'use strict';

const fancyLog = require('fancy-log');
const PluginError = require('plugin-error');
const es = require('event-stream');
const BufferStreams = require('bufferstreams');
const getFileExt = require('path').extname;
const escapeStringRegexp = require('escape-string-regexp');
const PLUGIN_NAME = 'gulp-remove-code';
const regexCache = new Map([]);
const extensions = new Map([
  ['coffee', [['#', ''], ['###', '###']]],
  ['css', [['/*', '*/']]],
  ['html', [['<!--', '-->']]],
  ['cshtml', [['@*', '*@']]],
  ['jade', [['//-', '']]],
  ['js', [['//', ''], ['/*', '*/']]],
  ['ts', [['//', ''], ['/*', '*/']]],
  ['jsx', [['//', ''], ['/*', '*/']]],
  ['tsx', [['//', ''], ['/*', '*/']]],
]);

module.exports = function gulpRemoveCode(options) {
  options = options || {};

  let commentEnd = '';
  let commentStart;       // not set means autodetect

  const conditions = Object.keys(options).reduce((conditions, key) => {
    if (key === 'commentStart') {
      commentStart = options.commentStart;
    }
    else if (key === 'commentEnd') {
      if (commentStart) {
        // set it only if commentStart is provided
        commentEnd = options.commentEnd;
      }
      else {
        fancyLog.warn(`${PLUGIN_NAME}: commentStart was not set but commentEnd provided.` +
          ` The option will be ignored. commentEnd: ${commentEnd}`);
      }
    }
    else {
      conditions.push([key, options[key]]);
    }
    return conditions;
  }, []);

  return es.map(
    /**
     * @param {File} file
     * @param {Function} callback
     */
    function(file, callback) {
      const fileExt = (file.path ? getFileExt(file.path).substr(1).toLowerCase() : '');
      if (file.isNull()) {
        // Nothing to do if no contents
        callback(null, file);
      }
      else if (file.isStream()) {
        file.contents = file.contents.pipe(
          new BufferStreams(function(err, buf, cb) {
            if (err) {
              return cb(new PluginError(PLUGIN_NAME, err));
            }
            let result, error;
            try {
              result = applyReplacements(buf, fileExt, commentStart, commentEnd, conditions);
            }
            catch (err) {
              error = new PluginError(PLUGIN_NAME, err);
            }
            cb(error, result);
          })
        );
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

/**
 * @param {Buffer} buffer
 * @param {string} fileExt
 * @param {string} [commentStart]
 * @param {string} [commentEnd]
 * @param {Array.<string>} conditions
 * @returns {Buffer}
 */
function applyReplacements(buffer, fileExt, commentStart, commentEnd, conditions) {
  let commentTypes;

  if (!commentStart) {
    commentTypes = extensions.has(fileExt) ? extensions.get(fileExt) : [['//', '']];
  }
  else {
    commentTypes = [[commentStart, commentEnd]];
  }
  let contents = buffer.toString();

  if (contents.length > 0) {
    for (let i = 0; i < conditions.length; i++) {
      const key = conditions[i][0];
      const value = conditions[i][1];

      commentTypes.forEach(item => {
        const commentStart = item[0];
        const commentEnd = item[1];
        let regex = getRemovalTagsRegExp(commentStart, commentEnd, key);

        contents = contents.replace(regex, function(ignore, original, capture) {
          const not = (capture === '!');
          return (value ^ not) ? '' : original;
        });
      });
    }
  }
  return new Buffer(contents);
}


/**
 * @param {string} commentStart
 * @param {string} commentEnd
 * @param {string} key
 * @returns {RegExp}
 */
function getRemovalTagsRegExp(commentStart, commentEnd, key) {
  const cacheKey = `${commentStart}${commentEnd}${key}`;
  const escapedKey = escapeStringRegexp(key);
  let pattern;

  if (regexCache.has(cacheKey)) {
    pattern = regexCache.get(cacheKey);
  }
  else {
    pattern = [
      '(',
      escapeStringRegexp(commentStart),
      '\\s*removeIf\\((!?)',
      escapedKey,
      '\\)\\s*',
      escapeStringRegexp(commentEnd),
      '\\s*' +
      '(\\n|\\r|.)*?',
      escapeStringRegexp(commentStart),
      '\\s*endRemoveIf\\((!?)',
      escapedKey,
      '\\)\\s*',
      escapeStringRegexp(commentEnd),
      ')',
    ].join('');
  }
  return new RegExp(pattern, 'gi');
}
