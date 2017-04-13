const reactHelmet = jest.genMockFromModule('react-helmet')

reactHelmet.renderStatic = function () {
  return {}
}

module.exports.default = reactHelmet
