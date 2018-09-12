'use strict'

const entries = require('object.entries')
const escapeStringRegexp = require('escape-string-regexp')
const through = require('through2')
const BufferStreams = require('bufferstreams')
const getFileExt = require('path').extname
const PluginError = require('plugin-error')

const PLUGIN_NAME = 'gulp-remove-code'
const regexCache = new Map()
const extensions = new Map([
  ['.coffee', [['#', ''], ['###', '###']]],
  ['.css', [['/*', '*/']]],
  ['.html', [['<!--', '-->']]],
  ['.cshtml', [['@*', '*@'], ['<!--', '-->']]],
  ['.jade', [['//-', '']]],
  ['.js', [['//', ''], ['/*', '*/']]],
  ['.ts', [['//', ''], ['/*', '*/']]],
  ['.jsx', [['//', ''], ['/*', '*/']]],
  ['.tsx', [['//', ''], ['/*', '*/']]]
])

function applyReplacements (buffer, {commentTypes, conditions}) {
  let contents = buffer.toString()

  if (buffer.length > 0) {
    for (const [key, value] of conditions) {
      for (const [commentStart, commentEnd] of commentTypes) {
        const regex = getRemovalTagsRegExp(commentStart, commentEnd, key)

        contents = contents.replace(regex, function (ignore, original, capture) {
          const not = (capture === '!')
          return (value ^ not) ? '' : original
        })
      }
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

  if (regexCache.has(cacheKey)) {
    return regexCache.get(cacheKey)
  }

  const escapedCommentStart = escapeStringRegexp(commentStart)
  const escapedKey = escapeStringRegexp(key)
  const escapedCommentEnd = escapeStringRegexp(commentEnd)
  const pattern = [
    '(',
    escapedCommentStart,
    '\\s*removeIf\\((!?)',
    escapedKey,
    '\\)\\s*',
    escapedCommentEnd,
    '\\s*' +
    '(\\n|\\r|.)*?',
    escapedCommentStart,
    '\\s*endRemoveIf\\((!?)',
    escapedKey,
    '\\)\\s*',
    escapedCommentEnd,
    ')'
  ].join('')
  const re = new RegExp(pattern, 'gi')

  regexCache.set(cacheKey, re)

  return re
}

// --------------------------------------------------------------------------------------------------

module.exports = function (options) {
  options = Object.assign({}, options)
  options.conditions = []

  for (const condition of entries(options)) {
    if (condition[0] !== 'commentStart' && condition[0] !== 'commentEnd') {
      options.conditions.push(condition)
    }
  }

  return through.obj(function (file, enc, callback) {
    const stream = this

    options = prepareOptions(file, options)

    file.contents = getFileContents(file, options, stream)

    stream.push(file)
    callback()
  })
}

function getFileContents (file, options, stream) {
  if (file.isNull()) {
    return file.contents
  }

  if (file.isBuffer()) {
    return getBufferContents(file, options, stream)
  }

  if (file.isStream()) {
    return getStreamContents(file, options, stream)
  }
}

function getBufferContents (file, options, stream) {
  const parsed = removeCode(file, file.contents, options)

  if (parsed instanceof PluginError) {
    stream.emit('error', parsed)
    return Buffer.from('')
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
  if (!file.isNull()) {
    if (!options.commentStart) {
      // Detect comment tokens
      const fileExt = getFileExt(file.path)
      options.commentTypes = extensions.has(fileExt) ? extensions.get(fileExt) : [['//', '']]
    } else {
      options.commentTypes = [[options.commentStart, options.commentEnd || '']]
    }
  }

  return options
}

function getError (error) {
  return new PluginError(PLUGIN_NAME, error, {showStack: true})
}
