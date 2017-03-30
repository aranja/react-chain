import Session from '../Session'

describe('Session', () => {
  it('should throw for unknown targets', async () => {
    const session = new Session()


    expect(() => {
      session.on('unknown')
    }).toThrowErrorMatchingSnapshot()
  })

  it('unfolds correct middleware chain', async () => {
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

    session.render('browser', () => {
      browserCallOrder.push('ACTUAL_RENDER')
    })

    session.render('server', () => {
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

  it.skip('should throw if fails to call render', async () => {
    const session = new Session()

    session.on('browser', render => {
      session.props.someEdit = 'someEdit'
      render()
    })

    expect(() => {
      session.render('browser', () => { })
    }).toThrow()
  })

  it('can modify the context', async () => {
    const session = new Session()

    session.on('browser', render => {
      session.props.someEdit = 'someEdit'
      render()
    })

    session.on('browser', render => {
      session.props.someEdit += ' anotherEdit'
      render()
    })

    session.render('browser', () => { })

    expect(session.props).toHaveProperty('someEdit', 'someEdit anotherEdit')
  })
})
