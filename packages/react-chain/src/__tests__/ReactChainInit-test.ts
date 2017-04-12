import middleware from '../ReactChainInit'
import createSession from '../Session'

describe('ReactChainInit', () => {
  it('should be a function', () => {
    expect(typeof middleware).toBe('function')
  })

  it('should add non-configurable properties', () => {
    const props = [
      'htmlProps',
      'bodyProps',
      'window',
      'head',
      'footer',
      'css',
      'js',
    ]
    const session = createSession()
    middleware(session)
    props.forEach(prop => {
      expect(session).toHaveProperty(prop)
      expect(() => delete session[prop]).toThrowErrorMatchingSnapshot()
    })
  })
})
