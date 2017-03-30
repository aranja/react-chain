'use strict'

function factory() {
  return {
    listen(cb) {
      if (typeof cb === 'function') {
        cb()
      }
    }
  }
}

module.exports.default = jest.fn(factory)
