'use strict'

const history = jest.genMockFromModule('history')

const browserSpies = []
const memorySpies = []

function factory() {
  return {
    listen(cb) {
      if (typeof cb === 'function') {
        cb()
      }
    }
  }
}

history.createBrowserHistory = jest.fn(factory)

history.createMemoryHistory = jest.fn(factory)

module.exports = history
