import 'react'
import createSession from '../Session'
import { unfoldRender } from '../utils'
import { Session } from '../types'

describe('Session', () => {
  let session: Session

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
    const props: Array<keyof Session> = ['__elementChain', '__browserChain', '__serverChain', 'on']
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

    unfoldRender(session, 'browser', () => {
      browserCallOrder.push('ACTUAL_RENDER')
    })

    unfoldRender(session, 'server', () => {
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

  it('should throw if fails to call render callback', () => {
    session.on('browser', render => {
      render()
    })

    session.on('browser', render => { })

    expect(() => {
      unfoldRender(session, 'browser')
    }).toThrow()
  })

  it('can modify the exposed instance', () => {
    let fakeSession: Session & { someEdit?: string }
    fakeSession = createSession()

    fakeSession.on('browser', render => {
      fakeSession.someEdit = 'someEdit'
      render()
    })

    fakeSession.on('browser', render => {
      fakeSession.someEdit += ' anotherEdit'
      render()
    })

    unfoldRender(fakeSession, 'browser')

    expect(fakeSession).toHaveProperty('someEdit', 'someEdit anotherEdit')
  })
})
