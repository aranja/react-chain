import Session from '../Session'
import * as React from 'react'
import { render } from '../SessionUtils'

describe('Session', () => {
  it('should throw if render isn\'t a function', () => {
    const session = new Session()

    expect(() => {
      session.on('browser')
    }).toThrowErrorMatchingSnapshot()
  })

  it('should throw for unknown targets', () => {
    const session = new Session()

    expect(() => {
      session.on()
    }).toThrowErrorMatchingSnapshot()
  })

  it('unfolds correct middleware chain', () => {
    const browserCallOrder: string[] = []
    const serverCallOrder: string[] = []
    const session = new Session()

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
    const session = new Session()

    session.on('browser', render => {
      render()
    })

    session.on('browser', render => { })

    expect(() => {
      render(session, 'browser')()
    }).toThrow()
  })

  it('can modify the context', () => {
    const session = new Session()

    session.on('browser', render => {
      session.props.someEdit = 'someEdit'
      render()
    })

    session.on('browser', render => {
      session.props.someEdit += ' anotherEdit'
      render()
    })

    render(session, 'browser')()

    expect(session.props).toHaveProperty('someEdit', 'someEdit anotherEdit')
  })

  it('should keep track of current render chain', () => {
    const session = new Session()
    expect(session).toHaveProperty('__elementChain')
  })
})
