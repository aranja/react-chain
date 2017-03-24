import createReactChain from '../ReactChain'
import { createElement } from 'react'
import { shallow } from 'enzyme'
import createContext from '../Context'
import { ReactChainBase } from '../ReactChainBase'

describe('ReactChain', () => {
  describe('.chain()', () => {
    test('is callable', () => {
      const app = createReactChain()
      expect(typeof app.chain).toBe('function')
    })

    test('is chainable', () => {
      const app = createReactChain()
      expect(app.chain({})).toBe(app)
    })

    test('createElement gets wrapped', async () => {
      const app = createReactChain()

      app.chain({
        async createElement() {
          return createElement('div', {}, 'dummy element')
        },
      })

      const element = await app.getElement()
      const wrapper = shallow(element)
      const instance = wrapper.instance()

      expect(instance).toBeInstanceOf(ReactChainBase)
      expect(wrapper.html()).toBe('<div>dummy element</div>')
    })

    test('wraps same ReactChainBase component each time', async () => {
      const app = createReactChain()
      const element1 = await app.getElement()
      const element2 = await app.getElement()
      expect(element1.type).toEqual(element2.type)
    })

    test('createElement can modify the context', async () => {
      const app = createReactChain()

      app.chain({
        async createElement(renderChildren, context) {
          context.htmlProps.someEdit = 'someEdit'
          return await renderChildren()
        }
      })

      app.chain({
        async createElement(renderChildren, context) {
          context.htmlProps.someEdit += ' anotherEdit'
          return await renderChildren()
        }
      })

      const context = createContext()
      await app.getElement(context)

      expect(context).toEqual({
        htmlProps: {
          someEdit: 'someEdit anotherEdit',
        },
      })
    })

    test('renderChildren should always be callable', async () => {
      const app = createReactChain()

      app.chain({
        async createElement(renderChildren) {
          const element = await renderChildren()
          return createElement('div', { className: 'wrap' }, element)
        },
      })

      const element = await app.getElement()
      const wrapper = shallow(element)

      expect(wrapper.html()).toBe('<div class="wrap"></div>')
    })

    test('middleware is not required', async () => {
      const app = createReactChain()
      const element = await app.getElement()
      expect(element.props).toHaveProperty('context', {
        htmlProps: {},
      })
    })

    it('should accept a function [createElement] that returns a promise', async () => {
      const app = createReactChain()
      const createElementMock = jest.fn(() => Promise.resolve())
      app.chain(createElementMock)
      await app.getElement()
      expect(createElementMock).toHaveBeenCalled()
    })

    it('should throw when createElement is not a function', () => {
      const app = createReactChain()
      expect(() => {
        app.chain({
          createElement: 'not a function',
        })
      }).toThrowErrorMatchingSnapshot()
    })

    it('should throw when wrapClientRender is not a function', () => {
      const app = createReactChain()
      expect(() => {
        app.chain({
          wrapClientRender: 'not a function',
        })
      }).toThrowErrorMatchingSnapshot()
    })

    it('should throw when wrapServerRender is not a function', () => {
      const app = createReactChain()
      expect(() => {
        app.chain({
          wrapServerRender: 'not a function',
        })
      }).toThrowErrorMatchingSnapshot()
    })
  })

  describe('.renderServer()', () => {
    it('should be callable', () => {
      const app = createReactChain()
      expect(typeof app.renderServer).toBe('function')
    })

    it('should return the string returned from the callback', () => {
      const app = createReactChain()
      const body = app.renderServer(createContext(), () => 'foo')
      expect(body).toBe('foo')
    })

    test('unfolds the middleware chain', () => {
      const wrapServerRender1 = jest.fn((render) => render())
      const wrapServerRender2 = jest.fn((render) => render())
      const app = createReactChain()
      app.chain({ wrapServerRender: wrapServerRender1 })
      app.chain({ wrapServerRender: wrapServerRender2 })
      app.renderServer(createContext(), () => '')
      expect(wrapServerRender1).toBeCalled()
      expect(wrapServerRender2).toBeCalled()
    })

    test('wrapServerRender can modify the context', () => {
      const app = createReactChain()

      app.chain({
        wrapServerRender(render, context) {
          context.htmlProps.someEdit = 'someEdit'
          render()
        }
      })

      app.chain({
        wrapServerRender(render, context) {
          context.htmlProps.someEdit += ' anotherEdit'
          render()
        }
      })

      const context = createContext()
      app.renderServer(context, () => '')
      expect(context).toHaveProperty('htmlProps', {
        someEdit: 'someEdit anotherEdit',
      })
    })
  })

  describe('.renderClient()', () => {
    it('should be callable', () => {
      const app = createReactChain()
      expect(typeof app.renderClient).toBe('function')
    })

    it('unfolds the middleware chain', () => {
      const wrapClientRender1 = jest.fn((render) => render())
      const wrapClientRender2 = jest.fn((render) => render())
      const app = createReactChain()
      app.chain({ wrapClientRender: wrapClientRender1 })
      app.chain({ wrapClientRender: wrapClientRender2 })
      app.renderClient(createContext(), () => '')
      expect(wrapClientRender1).toBeCalled()
      expect(wrapClientRender2).toBeCalled()
    })

    it('can modify the context', () => {
      const app = createReactChain()

      app.chain({
        wrapClientRender(render, context) {
          context.htmlProps.someEdit = 'someEdit'
          render()
        }
      })

      app.chain({
        wrapClientRender(render, context) {
          context.htmlProps.someEdit += ' anotherEdit'
          render()
        }
      })

      const context = createContext()
      app.renderClient(context, () => '')
      expect(context).toHaveProperty('htmlProps', {
        someEdit: 'someEdit anotherEdit',
      })
    })

    it('should have after render callback', async () => {
      const app = createReactChain()
      const context = createContext()
      let hasRendered = false

      await app.renderClient(context, () => {
        hasRendered = true
      })

      expect(hasRendered).toBeTruthy()
    })
  })
})
