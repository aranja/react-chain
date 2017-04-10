import createReactChain, { ReactChain } from '../ReactChain'
import createSession, { SessionT } from '../Session'
import * as React from 'react'
import { shallow } from 'enzyme'
import { ReactChainProvider } from '../ReactChainProvider'
import reactChainInitMiddleware from '../ReactChainInit'

describe('ReactChain', () => {
  let app: ReactChain
  let internalSession: SessionT

  beforeEach(() => {
    app = createReactChain()
    internalSession = createSession()
  })

  describe('.createSession()', () => {
    it('should create a new internal session object', () => {
      expect(app.createSession).toEqual(createSession)
    })
  })

  describe('.chain()', () => {
    test('is callable', () => {
      expect(typeof app.chain).toBe('function')
    })

    it('should throw if a middleware isn\'t a function', () => {
      expect(() => app.chain()).toThrowErrorMatchingSnapshot()
    })

    it('should return the chain instance', () => {
      expect(app.chain(() => { })).toBe(app)
    })

    it('should initialize the chain with ReactChainInit', async () => {
      expect(app.middlewareChain.length).toBe(1)
      expect(app.middlewareChain[0]).toBe(reactChainInitMiddleware)
    })

    it('should have mutable props', async () => {
      app.chain(session => {
        session.someEdit = 'someEdit'
      })

      app.chain(session => {
        session.someEdit += ' anotherEdit'
      })

      await app.getElement(internalSession)

      expect(internalSession).toHaveProperty('someEdit', 'someEdit anotherEdit')
    })

    it('should always be possible to await next, even at the end of the chain', async () => {
      app.chain(() => async next => {
        const element = await next()
        return <div className="wrap">{element}</div>
      })

      const element = await app.getElement(internalSession)
      const wrapper = shallow(element)

      expect(wrapper.html()).toBe('<div class="wrap"></div>')
    })
  })

  describe('.getElement()', () => {
    it('should throw if session is undefined', done => {
      app.getElement().catch((err) => {
        expect(err.message).toMatchSnapshot()
        done()
      })
    })

    it('should wrap with ReactChainProvider', async () => {
      const element = await app.getElement(internalSession)
      const wrapper = shallow(element)
      const instance = wrapper.instance()

      expect(instance).toBeInstanceOf(ReactChainProvider)
    })

    it('should wrap same ReactChainProvider component each time', async () => {
      const element1 = await app.getElement(internalSession)
      const element2 = await app.getElement(internalSession)

      expect(element1.type).toEqual(element2.type)
    })

    it('should reuse previous session and element chain each time', async () => {
      const actual: any[] = []

      app.chain(session => () => {
        actual.push(session)
        return <div />
      })

      await app.getElement(internalSession)
      await app.getElement(internalSession)

      expect(actual).toEqual([
        internalSession,
        internalSession,
      ])
    })
  })

  describe('.renderServer()', () => {
    it('should be callable', () => {
      expect(typeof app.renderServer).toBe('function')
    })

    it('should pass the element to the render callback', async () => {
      const html = await app.renderServer(internalSession, element => JSON.stringify(element))
      expect(html).toMatchSnapshot()
    })
  })

  describe('.renderBrowser()', () => {
    it('should be callable', () => {
      expect(typeof app.renderBrowser).toBe('function')
    })

    it('should pass the element to the render callback', done => {
      app.renderBrowser(internalSession, element => {
        expect(element).toBeDefined()
        expect(shallow(element).instance()).toBeInstanceOf(ReactChainProvider)
        done()
      })
    })
  })
})
