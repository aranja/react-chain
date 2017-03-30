import createBase from './ReactChainBase'
import { ReactElement } from 'react'
import Session from './Session'

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
  (session: Session) =>
    (void | WrapElement)

export class ReactChain {
  protected middlewareChain: Array<Middleware> = []
  protected elementChain: Array<WrapElement>

  chain(middleware: Middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('A react-chain middleware should be a function')
    }

    this.middlewareChain.push(middleware)

    return this
  }

  async getElement(session = new Session()) {
    if (!this.elementChain) {
      this.elementChain = []

      this.middlewareChain.forEach(middleware => {
        const createElement = middleware(session)

        if (typeof createElement === 'function') {
          this.elementChain.push(createElement)
        }
      })
    }

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

  renderBrowser(session: Session, onRender: Function) {
    session.render('browser', onRender)
  }

  renderServer(session: Session, onRender: Function) {
    let body: string = ''
    session.render('server', () => {
      body = onRender()
    })
    return body
  }
}

export default function createReactChain() {
  return new ReactChain()
}
