import startClient from '../startClient'
import createReactChain, { ReactChain } from '../ReactChain'
import * as React from 'react'

describe('startClient()', () => {
  let appRoot: Element
  let app: ReactChain

  beforeEach(() => {
    app = createReactChain()
    appRoot = document.createElement('div')
    document.body.appendChild(appRoot)
  })

  it('should be callable', () => {
    expect(typeof startClient).toBe('function')
  })

  it('should return a promise', () => {
    const client = startClient(app, appRoot)
    expect(typeof client.then).toBe('function')
    expect(typeof client.catch).toBe('function')
  })

  it('should add a refresh function on the context', async () => {
    const session = app.createSession()
    app.createSession = () => session
    await startClient(app, appRoot)
    expect(typeof session.refresh).toBe('function')
  })

  it('should render a React component to the appRoot', async () => {
    app.chain((session) => () => <div>React Element</div>)
    await startClient(app, appRoot)
    expect(appRoot.innerHTML).toMatchSnapshot()
  })

  it('should rerender when refresh is called', done => {
    app.chain(session => {
      setTimeout(() => {
        if (session.refresh) {
          session.refresh(() => {
            done()
          })
        }
      })

      return async next => {
        return await next()
      }
    })

    startClient(app, appRoot)
  })
})
