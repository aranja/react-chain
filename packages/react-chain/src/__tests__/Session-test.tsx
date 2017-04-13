import createSession, { SessionT } from '../Session'
import reactChainProvider from '../ReactChainProvider'
import { render } from '../SessionUtils'
import 'react'

describe('Session', () => {
  let session: SessionT

  beforeEach(() => {
    session = createSession()
  })

  it('should throw if render isn\'t a function', () => {
    expect(() => {
      session.on('browser')
    }).toThrowErrorMatchingSnapshot()
  })

  it('should throw for unknown targets', () => {
    expect(() => {
      session.on()
    }).toThrowErrorMatchingSnapshot()
  })

  it('should have readonly properties', () => {
    const props: Array<keyof SessionT> = ['__elementChain', '__browserChain', '__serverChain', 'on']
    const fakeSession = createSession() as any
    let initial: any
    props.forEach(prop => {
      initial = fakeSession[prop]
      expect(initial).toBeDefined()
      expect(() => {
        fakeSession[prop] = 'fake'
      }).toThrowErrorMatchingSnapshot()
    })
  })

  it('unfolds correct middleware chain', () => {
    const browserCallOrder: string[] = []
    const serverCallOrder: string[] = []

    session.on('browser', render => {
      browserCallOrder.push('BROWSER_RENDER_1')
      render()
      browserCallOrder.push('BROWSER_RENDER_1')
    })

    session.on('browser', render => {
      browserCallOrder.push('BROWSER_RENDER_2')
      render()
      browserCallOrder.push('BROWSER_RENDER_2')
    })

    session.on('server', render => {
      serverCallOrder.push('SERVER_RENDER_1')
      render()
      serverCallOrder.push('SERVER_RENDER_1')
    })

    session.on('server', render => {
      serverCallOrder.push('SERVER_RENDER_2')
      render()
      serverCallOrder.push('SERVER_RENDER_2')
    })

    render(session, 'browser')(() => {
      browserCallOrder.push('ACTUAL_RENDER')
    })

    render(session, 'server')(() => {
      serverCallOrder.push('ACTUAL_RENDER')
      return ''
    })

    expect(browserCallOrder).toEqual([
      'BROWSER_RENDER_1',
      'BROWSER_RENDER_2',
      'ACTUAL_RENDER',
      'BROWSER_RENDER_2',
      'BROWSER_RENDER_1',
    ])

    expect(serverCallOrder).toEqual([
      'SERVER_RENDER_1',
      'SERVER_RENDER_2',
      'ACTUAL_RENDER',
      'SERVER_RENDER_2',
      'SERVER_RENDER_1',
    ])
  })

  it('should throw if fails to call render', () => {
    session.on('browser', render => {
      render()
    })

    session.on('browser', render => { })

    expect(() => {
      render(session, 'browser')()
    }).toThrow()
  })

  it('can modify the exposed instance', () => {
    let fakeSession: SessionT & { someEdit?: string }
    fakeSession = createSession()

    fakeSession.on('browser', render => {
      fakeSession.someEdit = 'someEdit'
      render()
    })

    fakeSession.on('browser', render => {
      fakeSession.someEdit += ' anotherEdit'
      render()
    })

    render(fakeSession, 'browser')()

    expect(fakeSession).toHaveProperty('someEdit', 'someEdit anotherEdit')
  })

  it('should have a render chain that starts with createReactChainProvider', () => {
    expect(session).toHaveProperty('__elementChain', [reactChainProvider])
  })
})
