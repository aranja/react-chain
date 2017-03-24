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
    let runOrder = 0
    app.getElement = jest.fn(() => { runOrder = 2 })
    app.renderClient = jest.fn(() => { runOrder *= 4 })
    await renderClient(app, appRoot)
    expect(app.getElement).toHaveBeenCalled()
    expect(app.renderClient).toHaveBeenCalled()
    expect(runOrder).toBe(8)
  })

  it('should add a refresh function on the context', async () => {
    let context = { refresh: null }
    app.getElement = jest.fn((internalContext) => { context = internalContext })
    app.renderClient = jest.fn()
    await renderClient(app, appRoot)
    expect(typeof context.refresh).toBe('function')
  })

  it('should render a React component to the appRoot', async () => {
    app.chain(() => createElement('div', {}, 'React Element'))
    await renderClient(app, appRoot)
    expect(appRoot.innerHTML).toMatchSnapshot()
  })

  it('should rerender when refresh is called', (done) => {
    let renderCount = 0

    function onComplete() {
      expect(renderCount).toBe(2)
      done()
    }

    app.chain(() => createElement('div', {}, `Render count ${++renderCount}`))

    app.chain({
      wrapClientRender(render, context) {
        if (renderCount === 1 && context.refresh) {
          context.refresh(onComplete)
        }
        render()
      }
    })

    renderClient(app, appRoot)
  })
})