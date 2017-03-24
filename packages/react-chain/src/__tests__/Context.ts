import createContext from '../Context'

describe('createContext()', () => {
  it('should be callable', () => {
    expect(typeof createContext).toBe('function')
  })

  it('should create a context object', () => {
    const context = createContext()
    expect(context).not.toBeUndefined()
    expect(context).toEqual({
      htmlProps: {},
    })
  })

  it('should take properties as arguments', () => {
    const context = createContext({ foo: 'bar' })
    expect(context).toEqual({
      htmlProps: {},
      foo: 'bar',
    })
  })
})