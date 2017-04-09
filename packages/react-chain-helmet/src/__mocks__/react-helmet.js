const reactHelmet = jest.genMockFromModule('react-helmet')

reactHelmet.rewind = function () {
  return true
}

module.exports.default = reactHelmet
