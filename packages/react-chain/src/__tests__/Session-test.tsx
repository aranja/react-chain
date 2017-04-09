import createSession, { InternalSessionT } from '../Session'
import * as React from 'react'
import { render } from '../SessionUtils'

describe('Session', () => {
  let internalSession: InternalSessionT

  beforeEach(() => {
    internalSession = createSession()
  })

  it('should throw if render isn\'t a function', () => {
    expect(() => {
      internalSession.on('browser')
    }).toThrowErrorMatchingSnapshot()
  })

  it('should throw for unknown targets', () => {
    expect(() => {
      internalSession.on()
    }).toThrowErrorMatchingSnapshot()
  })

  it('unfolds correct middleware chain', () => {
    const browserCallOrder: string[] = []
    const serverCallOrder: string[] = []

    internalSession.on('browser', render => {
      browserCallOrder.push('BROWSER_RENDER_1')
      render()
      browserCallOrder.push('BROWSER_RENDER_1')
    })

    internalSession.on('browser', render => {
      browserCallOrder.push('BROWSER_RENDER_2')
      render()
      browserCallOrder.push('BROWSER_RENDER_2')
    })

    internalSession.on('server', render => {
      serverCallOrder.push('SERVER_RENDER_1')
      render()
      serverCallOrder.push('SERVER_RENDER_1')
    })

    internalSession.on('server', render => {
      serverCallOrder.push('SERVER_RENDER_2')
      render()
      serverCallOrder.push('SERVER_RENDER_2')
    })

    render(internalSession, 'browser')(() => {
      browserCallOrder.push('ACTUAL_RENDER')
    })

    render(internalSession, 'server')(() => {
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
    internalSession.on('browser', render => {
      render()
    })

    internalSession.on('browser', render => { })

    expect(() => {
      render(internalSession, 'browser')()
    }).toThrow()
  })

  it('can modify the exposed instance', () => {
    const { exposed: session } = internalSession

    if (!session) {
      throw new Error()
    }

    internalSession.on('browser', render => {
      session.someEdit = 'someEdit'
      render()
    })

    internalSession.on('browser', render => {
      session.someEdit += ' anotherEdit'
      render()
    })

    render(internalSession, 'browser')()

    expect(internalSession.exposed).toHaveProperty('someEdit', 'someEdit anotherEdit')
  })

  it('should keep track of current render chain', () => {
    expect(internalSession).toHaveProperty('elementChain')
  })
})
