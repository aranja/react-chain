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

  it('should call unfoldRender and modify the context on server unfoldRender', done => {
    const next = jest.fn()
    const on = jest.fn((_, render) => {
      render(next)
      expect(sessionMock).toHaveProperty('helmet', {})
      expect(next).toHaveBeenCalled()
      done()
    })
    const sessionMock = { on }
    chainHelmet()(sessionMock as any)
  })
})
