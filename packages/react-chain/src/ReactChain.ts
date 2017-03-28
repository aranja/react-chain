import createContext, { Context } from './Context'
import createBase from './ReactChainBase'
import { ReactElement } from 'react'

export type RenderTarget =
  'browser' |
  'server'

export type WrapElement =
  (renderChildren: () => Promise<null | ReactElement<any>>) =>
    Promise<ReactElement<any>>

export type WrapRender =
  (render: Function) =>
    void

export interface SessionAPI {
  on: (target: 'server' | 'browser', render: Function) => void
  refresh?: () => void
  req?: Request
  res?: Response
  props: any
  window: any
}

export type Middleware =
  (session: SessionAPI) =>
    (void | WrapElement)

export class Session {
  private browserChain: Array<Function> = []
  private serverChain: Array<Function> = []

  public props = {}
  public window = {}

  on(target: RenderTarget, render: Function) {
    switch (target) {
      case 'browser':
        this.browserChain.push(render)
        break
      case 'server':
        this.serverChain.push(render)
        break
      default:
        throw new Error()
    }
  }

  async renderBrowser() {

  }

  render() {}
}

export class ReactChain {
  protected middlewareChain: Array<Middleware> = []
  protected elementChain: Array<WrapElement> = []

  chain(middleware: Middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('A react-chain middleware should be a function')
    }

    this.middlewareChain.push(middleware)

    return this
  }

  async getElement(session = new Session()) {
    this.middlewareChain.forEach(middleware => {
      const createElement = middleware(session)
      if (typeof createElement === 'function') {
        this.elementChain.push(createElement)
      }
    })

    return this.unfoldElementChain(session)
  }

  private async unfoldElementChain(session: Session): Promise<ReactElement<any>> {
    const elementChain = [createBase, ...this.elementChain]
    let index = 0

    async function next(): Promise<any> {
      const createElement = elementChain[index++]
      const renderChildren = elementChain[index]
        ? await next
        : () => Promise.resolve(null)
      return createElement(renderChildren, session)
    }

    return await next()
  }

  renderClient(context: Context<any>, onRender: Function) {
    return new Promise(resolve => {
      this.renderWrapper(this.browserChain, () => {
        onRender()
        resolve()
      })
    })
  }

  renderServer(context: Context<any>, onRender: Function) {
    let body: string = ''
    this.renderWrapper(this.serverChain, () => {
      body = onRender()
    })
    return body
  }

  private renderWrapper(
    wrappers: Array<WrapRender>,
    onComplete: () => void
  ) {
    let index = 0

    if (wrappers.length === 0) {
      onComplete()
      return
    }

    function render() {
      const wrap = wrappers[index++]
      wrap(wrappers[index] == null ? onComplete : render, context)
    }

    render()
  }
}

export default function createReactChain() {
  return new ReactChain()
}
