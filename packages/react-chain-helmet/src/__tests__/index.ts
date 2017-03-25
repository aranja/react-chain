import chainHelmet from '../index'

jest.mock('react-helmet')

describe('react-chain-helmet', () => {
  it('should be a function', () => {
    expect(typeof chainHelmet).toBe('function')
  })

  it('should have wrapServerRender method', () => {
    const middleware = chainHelmet()
    expect(middleware).toHaveProperty('wrapServerRender')
    expect(typeof middleware.wrapServerRender).toBe('function')
  })

  it('should call render and modify the context', () => {
    const renderSpy = jest.fn()
    const contextFake = { htmlProps: {} }
    const middleware = chainHelmet()

    expect(contextFake.htmlProps).not.toHaveProperty('helmet')
    middleware.wrapServerRender(renderSpy, contextFake)

    expect(contextFake.htmlProps).toHaveProperty('helmet', true)
    expect(renderSpy).toHaveBeenCalled()
  })
})
