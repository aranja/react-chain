import middleware from '../ReactChainInit'

describe('ReactChainInit', () => {
  it('should be a function', () => {
    expect(typeof middleware).toBe('function')
  })

  it('should add `htmlProps`, `headProps` and `window` properties as objects', () => {
    const fakeSession = {}
    middleware(fakeSession)
    expect(fakeSession).toHaveProperty('htmlProps')
    expect(fakeSession).toHaveProperty('headProps')
    expect(fakeSession).toHaveProperty('window')
  })
})
