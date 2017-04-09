import chainHelmet from '../ReactChainHelmet'

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
    const next = jest.fn()
    const on = jest.fn((target, render) => {
      render(next)
      expect(sessionMock.headProps).toHaveProperty('helmet', true)
      expect(next).toHaveBeenCalled()
      done()
    })
    const sessionMock = {
      on,
      headProps: {},
    }
    chainHelmet()(sessionMock)
  })
})
