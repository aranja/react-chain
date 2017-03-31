import createBase from './ReactChainBase'
import { ReactElement } from 'react'
import Session from './Session'
import { getChainForTarget, renderRecursively, render } from './SessionUtils'

export type RenderTarget =
  'browser' |
  'server'

export type WrapElement =
  (renderChildren: () => Promise<null | ReactElement<any>>, context: any) =>
    ReactElement<any> | Promise<ReactElement<any>>

export type WrapRender =
  (render: Function) =>
    void

export type Middleware =
  (session: Session) =>
    (void | WrapElement)

export class ReactChain {
  protected middlewareChain: Array<Middleware> = []

  chain(middleware?: Middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('A react-chain middleware should be a function')
    }

    this.middlewareChain.push(middleware)

    return this
  }

  async getElement(session = new Session()): Promise<any> {
    if (session.__firstRender) {
      session.__elementChain = [createBase]
      this.middlewareChain.forEach(middleware => {
        const createElement = middleware(session)
        if (createElement) {
          session.__elementChain.push(createElement)
        }
      })
      session.__firstRender = false
    }

    let index = 0
    const next = (): Promise<any> => {
      const createElement = session.__elementChain[index++]
      const renderChildren = session.__elementChain[index]
        ? next
        : () => Promise.resolve(null)
      return Promise.resolve(createElement(renderChildren, session))
    }

    return await next()
  }

  renderBrowser(session: Session, onRender: () => void) {
    render(session, 'browser')(onRender)
  }

  renderServer(session: Session, onRender: Function) {
    let body = ''
    render(session, 'server')(() => {
      body = onRender()
    })
    return body
  }
}

export default function createReactChain() {
  return new ReactChain()
}
