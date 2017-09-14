import * as React from 'react'
import createReactChain, { ReactChain } from '../ReactChain'
import createSession from '../Session'
import { shallow } from 'enzyme'
import { Middleware, Session } from '../types'

class TestProvider extends React.Component<any> {
  render() {
    return this.props.children
  }
}

const testMiddleware: Middleware = () => async (next) =>
  <TestProvider>{(await next())}</TestProvider>

describe('ReactChain', () => {
  let app: ReactChain
  let internalSession: Session

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

    it('should initialize an empty chain', async () => {
      expect(app.middlewareChain.length).toBe(0)
    })

    it('should have mutable props', async () => {
      app.chain((session: any) => {
        session.someEdit = 'someEdit'
      })

      app.chain((session: any) => {
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

    it('should throw when a middleware returns a ReactElement', async () => {
      app.chain(() => 'test' as any)

      try {
        await app.getElement(internalSession)
      } catch (error) {
        expect(error).toMatchSnapshot()
      }
    })

    it('should throw when a middleware returns a wrong type', async () => {
      app.chain(() => <div /> as any)

      try {
        await app.getElement(internalSession)
      } catch (error) {
        expect(error).toMatchSnapshot()
      }
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

    it('should return element for middleware', async () => {
      const actual = <div />
      app.chain(actual)

      const element = await app.getElement(internalSession)
      expect(element).toEqual(actual)
    })
  })

  describe('with middleware', () => {
    beforeEach(() => {
      app.chain(testMiddleware)
    })

    describe('.renderServer()', () => {
      it('should be callable', () => {
        expect(typeof app.renderServer).toBe('function')
      })

      it('should pass the element to the render callback', async () => {
        expect.hasAssertions()
        await app.renderServer(internalSession, element =>
          expect(element.type).toEqual(TestProvider)
        )
      })

      it('should return the result of the render callback', async () => {
        const actual = 'result'
        const result = await app.renderServer(internalSession, () => actual)
        expect(result).toEqual(actual)
      })

      it('should return the result of any truthy middleware', async () => {
        const actual = 'result'
        const wrong = 'wrong'
        app.chain(session => {
          session.on('server', render => {
            render()
            return actual
          })
        })

        const result = await app.renderServer(internalSession, () => wrong)
        expect(result).toEqual(actual)
      })
    })

    describe('.renderBrowser()', () => {
      it('should be callable', () => {
        expect(typeof app.renderBrowser).toBe('function')
      })

      it('should pass the element to the render callback', async () => {
        expect.assertions(2)
        await app.renderBrowser(internalSession, element => {
          expect(element).toBeDefined()
          expect(shallow(element).instance()).toBeInstanceOf(TestProvider)
        })
      })
    })
  })
})
