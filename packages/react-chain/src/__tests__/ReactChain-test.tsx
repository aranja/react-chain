import createReactChain, { ReactChain } from '../ReactChain'
import Session from '../Session'
import * as React from 'react'
import { shallow } from 'enzyme'
import { ReactChainBase } from '../ReactChainBase'

describe('ReactChain', () => {
  let app: ReactChain
  let session: Session

  beforeEach(() => {
    app = createReactChain()
    session = new Session()
  })

  describe('.chain()', () => {
    test('is callable', () => {
      expect(typeof app.chain).toBe('function')
    })

    it('should throw if a middleware isn\'t a function', () => {
      expect(() => app.chain()).toThrowErrorMatchingSnapshot()
    })

    it('should return the chain instance', () => {
      expect(app.chain(() => {})).toBe(app)
    })

    it('should have mutable props', async () => {
      const session = new Session()

      app.chain(session => {
        session.props.someEdit = 'someEdit'
      })

      app.chain(session => {
        session.props.someEdit += ' anotherEdit'
      })

      await app.getElement(session)

      expect(session.props).toHaveProperty('someEdit', 'someEdit anotherEdit')
    })

    it('should always be possible to await next, even at the end of the chain', async () => {
      app.chain(() => async next => {
        const element = await next()
        return <div className="wrap">{element}</div>
      })

      const element = await app.getElement(session)
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

    it('should wrap with ReactChainBase', async () => {
      const element = await app.getElement(session)
      const wrapper = shallow(element)
      const instance = wrapper.instance()

      expect(instance).toBeInstanceOf(ReactChainBase)
    })

    it('should wrap same ReactChainBase component each time', async () => {
      const element1 = await app.getElement(session)
      const element2 = await app.getElement(session)

      expect(element1.type).toEqual(element2.type)
    })

    it('should reuse previous session and element chain each time', async () => {
      const actual: any[] = []

      app.chain(session => () => {
        actual.push(session)
        return <div />
      })

      await app.getElement(session)
      await app.getElement(session)

      expect(actual).toEqual([
        session,
        session,
      ])
    })
  })

  describe('.renderServer()', () => {
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
    it('should be callable', () => {
      expect(typeof app.renderBrowser).toBe('function')
    })
  })
})
