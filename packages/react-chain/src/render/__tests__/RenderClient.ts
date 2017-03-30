import renderClient from '../RenderClient'
import createReactChain from '../../ReactChain'
import { ReactChain } from '../../ReactChain'
import { createElement } from 'react'

describe('renderClient()', () => {
  let appRoot: Element
  let app: ReactChain

  beforeEach(() => {
    app = createReactChain()
    appRoot = document.createElement('div')
    document.body.appendChild(appRoot)
  })

  it('should be callable', () => {
    expect(typeof renderClient).toBe('function')
  })

  it('should return a promise', () => {
    const client = renderClient(app, appRoot)
    expect(typeof client.then).toBe('function')
    expect(typeof client.catch).toBe('function')
  })

  it('should await getElement before rendering', async () => {
    const callOrder = []
    app.getElement = jest.fn(() => callOrder.push('GET_ELEMENT'))
    app.renderBrowser = jest.fn(() => callOrder.push('RENDER_BROWSER'))
    await renderClient(app, appRoot)
    expect(app.getElement).toHaveBeenCalled()
    expect(app.renderBrowser).toHaveBeenCalled()
    expect(callOrder).toEqual([
      'GET_ELEMENT',
      'RENDER_BROWSER',
    ])
  })

  it('should add a refresh function on the context', async () => {
    let session = { refresh: null }
    app.getElement = jest.fn((internalSession) => { session = internalSession })
    app.renderBrowser = jest.fn()
    await renderClient(app, appRoot)
    expect(typeof session.refresh).toBe('function')
  })

  it('should render a React component to the appRoot', async () => {
    app.chain((session) => () => createElement('div', {}, 'React Element'))
    await renderClient(app, appRoot)
    expect(appRoot.innerHTML).toMatchSnapshot()
  })

  it.only('should rerender when refresh is called', done => {
    let renderCount = 0

    app.chain(session => {
      session.on('browser', render => {
        console.log('here');

        expect(renderCount).toEqual(1)
        render()
        expect(renderCount).toEqual(1)
        done()
      })

      return async next => {
        console.log('render');

        renderCount += 1
        return await next()
      }
    })

    renderClient(app, appRoot)
  })
})