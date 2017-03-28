import chainHelmet from '../index'

jest.mock('react-helmet')

describe('react-chain-helmet', () => {
  it('should be a function', () => {
    expect(typeof chainHelmet).toBe('function')
  })

  it('should return a session function', () => {
    const session = chainHelmet()
    expect(typeof session).toBe('function')
  })

  it('should call render and modify the context on server render', done => {
    const renderSpy = jest.fn()
    const wrapServerSpy = jest.fn((server) => {
      server(renderSpy)
      expect(sessionMock.props).toHaveProperty('helmet', true)
      expect(renderSpy).toHaveBeenCalled()
      done()
    })
    const sessionMock = {
      wrapServer: wrapServerSpy,
      props: {},
    }

    chainHelmet()(sessionMock)
    expect(wrapServerSpy).toHaveBeenCalled()
  })
})
