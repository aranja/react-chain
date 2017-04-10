import middleware from '../ReactChainInit'
import createSession from '../Session'

describe('ReactChainInit', () => {
  it('should be a function', () => {
    expect(typeof middleware).toBe('function')
  })

  it('should add `htmlProps`, `headProps` and `window` properties as objects', () => {
    const fakeSession = createSession()
    middleware(fakeSession)
    expect(fakeSession).toHaveProperty('htmlProps')
    expect(fakeSession).toHaveProperty('headProps')
    expect(fakeSession).toHaveProperty('window')
  })
})
