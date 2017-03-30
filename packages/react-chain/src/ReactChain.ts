import createBase from './ReactChainBase'
import { ReactElement } from 'react'
import Session from './Session'

export type RenderTarget =
  'browser' |
  'server'

export type WrapElement =
  (renderChildren: () => Promise<null | ReactElement<any>>) =>
    ReactElement<any> | Promise<ReactElement<any>>

export type WrapRender =
  (render: Function) =>
    void

export type Middleware =
  (session: Session) =>
    (void | WrapElement)

export class ReactChain {
  protected middlewareChain: Array<Middleware> = []
  protected elementChain: Array<typeof createBase | WrapElement> = []

  private firstRender = true

  chain(middleware?: Middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('A react-chain middleware should be a function')
    }

    this.middlewareChain.push(middleware)
    this.firstRender = true

    return this
  }

  async getElement(session = new Session()) {
    if (this.firstRender) {
      this.elementChain = [createBase]

      for (const middleware of this.middlewareChain) {
        const createElement = middleware(session)

        if (typeof createElement === 'function') {
          this.elementChain.push(createElement)
        }
      }
    }

    let index = 0
    this.firstRender = false

    const next = async (): Promise<any> => {
      const createElement = this.elementChain[index++]
      const renderChildren = this.elementChain[index]
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
