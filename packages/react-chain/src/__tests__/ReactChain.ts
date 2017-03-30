import createReactChain from '../ReactChain'
import Session from '../Session'
import { createElement } from 'react'
import { shallow } from 'enzyme'
import { ReactChainBase } from '../ReactChainBase'

describe('ReactChain', () => {
  describe('.chain()', () => {
    test('is callable', () => {
      const app = createReactChain()
      expect(typeof app.chain).toBe('function')
    })

    it('should throw if a middleware isn\'t a function', () => {
      const app = createReactChain()
      expect(() => app.chain()).toThrowErrorMatchingSnapshot()
    })

    it('should be chainable', () => {
      const app = createReactChain()
      expect(app.chain(() => { })).toBe(app)
    })

    it('should wrap with ReactChainBase', async () => {
      const app = createReactChain()

      const element = await app.getElement()
      const wrapper = shallow(element)
      const instance = wrapper.instance()

      expect(instance).toBeInstanceOf(ReactChainBase)
    })

    it('should wrap same ReactChainBase component each time', async () => {
      const app = createReactChain()
      const element1 = await app.getElement()
      const element2 = await app.getElement()
      expect(element1.type).toEqual(element2.type)
    })

    it('should have mutable props', async () => {
      const app = createReactChain()

      app.chain(session => {
        session.props.someEdit = 'someEdit'
      })

      app.chain(session => {
        session.props.someEdit += ' anotherEdit'
      })

      const session = new Session()
      await app.getElement(session)

      expect(session.props).toHaveProperty('someEdit', 'someEdit anotherEdit')
    })

    it('should always be possible to await next, even at the end of the chain', async () => {
      const app = createReactChain()

      app.chain(session => async next => {
        const element = await next()
        return createElement('div', { className: 'wrap' }, element)
      })

      const element = await app.getElement()
      const wrapper = shallow(element)

      expect(wrapper.html()).toBe('<div class="wrap"></div>')
    })

    it('should be possible to call getElement without a single middleware', async () => {
      const app = createReactChain()
      const element = await app.getElement()
      expect(element.props).toBeDefined()
    })
  })

  describe('.renderServer()', () => {
    let app

    beforeEach(() => {
      app = createReactChain()
    })

    it('should be callable', () => {
      expect(typeof app.renderServer).toBe('function')
    })

    it('should return the string returned from the callback', () => {
      const session = new Session()
      const body = app.renderServer(session, () => 'foo')
      expect(body).toBe('foo')
    })
  })

  describe('.renderBrowser()', () => {
    let app

    beforeEach(() => {
      app = createReactChain()
    })

    it('should be callable', () => {
      expect(typeof app.renderBrowser).toBe('function')
    })
  })
})
