'use strict'

const assign = require('object-assign')
const escapeStringRegexp = require('escape-string-regexp')
const through = require('through2')
const BufferStreams = require('bufferstreams')
const getFileExt = require('path').extname
const PluginError = require('plugin-error')

const PLUGIN_NAME = 'gulp-remove-code'
const regexCache = new Map([])
const extensions = new Map([
  ['.coffee', [['#', ''], ['###', '###']]],
  ['.css', [['/*', '*/']]],
  ['.html', [['<!--', '-->']]],
  ['.cshtml', [['@*', '*@']]],
  ['.jade', [['//-', '']]],
  ['.js', [['//', ''], ['/*', '*/']]],
  ['.ts', [['//', ''], ['/*', '*/']]],
  ['.jsx', [['//', ''], ['/*', '*/']]],
  ['.tsx', [['//', ''], ['/*', '*/']]]
])

function applyReplacements (buffer, {commentTypes, conditions}) {
  let contents = buffer.toString()

  if (buffer.length > 0) {
    for (let i = 0; i < conditions.length; i++) {
      const key = conditions[i][0]
      const value = conditions[i][1]

      commentTypes.forEach(item => {
        const commentStart = item[0]
        const commentEnd = item[1]
        const regex = getRemovalTagsRegExp(commentStart, commentEnd, key)

        contents = contents.replace(regex, function (ignore, original, capture) {
          const not = (capture === '!')
          return (value ^ not) ? '' : original
        })
      })
    }
  }

  return Buffer.from(contents)
}

/**
 * @param {string} commentStart
 * @param {string} commentEnd
 * @param {string} key
 * @returns {RegExp}
 */
function getRemovalTagsRegExp (commentStart, commentEnd, key) {
  const cacheKey = `${commentStart}${commentEnd}${key}`
  const escapedKey = escapeStringRegexp(key)
  let pattern

  if (regexCache.has(cacheKey)) {
    pattern = regexCache.get(cacheKey)
  } else {
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
      ')'
    ].join('')
  }
  return new RegExp(pattern, 'gi')
}

// --------------------------------------------------------------------------------------------------

module.exports = function (options) {
  return through.obj(function (file, enc, callback) {
    const stream = this

    options = prepareOptions(file, options)

    file.contents = getFileContents(file, options, stream, callback)

    stream.push(file)
    callback()
  })
}

function getFileContents (file, options, stream, callback) {
  if (file.isNull()) {
    return file.contents
  }

  if (file.isBuffer()) {
    return getBufferContents(file, options, stream, callback)
  }

  if (file.isStream()) {
    return getStreamContents(file, options, stream)
  }
}

function getBufferContents (file, options, stream, callback) {
  const parsed = removeCode(file, file.contents, options)

  if (parsed instanceof PluginError) {
    stream.emit('error', parsed)
    return callback()
  }

  return parsed
}

function getStreamContents (file, options, stream) {
  const streamer = new BufferStreams(function (err, buf, callback) {
    if (err) {
      stream.emit('error', getError(err))
      return callback()
    }

    const parsed = removeCode(file, buf, options)

    if (parsed instanceof PluginError) {
      stream.emit('error', parsed)
      return callback()
    }

    callback(null, parsed)
  })

  return file.contents.pipe(streamer)
}

function removeCode (file, buf, options) {
  try {
    const result = applyReplacements(buf, options)
    return Buffer.from(result)
  } catch (error) {
    return getError(error)
  }
}

function prepareOptions (file, options) {
  options = assign({}, options)

  const {commentStart, commentEnd} = options

  if (!file.isNull()) {
    options.conditions = Object.keys(options).reduce((conditions, key) => {
      if (key !== 'commentStart' && key !== 'commentEnd') {
        conditions.push([key, options[key]])
      }
      return conditions
    }, [])

    if (!commentStart) {
      // Detect comment tokens
      const fileExt = getFileExt(file.path)
      options.commentTypes = extensions.has(fileExt) ? extensions.get(fileExt) : [['//', '']]
    } else if (Array.isArray(commentStart) && Array.isArray(commentEnd) && commentStart.length === commentEnd.length) {
      options.commentTypes = []
      for (let i = 0; i < commentStart.length; i++)  {
        options.commentTypes.push([commentStart[i], commentEnd[i]])
      }
    } else {
      options.commentTypes = [[options.commentStart, options.commentEnd || '']]
    }
  }

  return options
}

function getError (error) {
  return new PluginError(PLUGIN_NAME, error, {showStack: true})
}
