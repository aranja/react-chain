import reactChainProvider from './ReactChainProvider'
import createSession, { ExposedSessionT, InternalSessionT } from './Session'
import { ReactElement } from 'react'
import { render } from './SessionUtils'
import reactChainInitMiddleware from './ReactChainInit'

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
  (session: ExposedSessionT) =>
    (void | WrapElement)

export class ReactChain {
  middlewareChain: Array<Middleware> = [reactChainInitMiddleware]

  chain(middleware?: Middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('A react-chain middleware should be a function')
    }

    this.middlewareChain.push(middleware)

    return this
  }

  createSession = createSession

  async getElement(session?: InternalSessionT): Promise<any> {
    if (session == null) {
      throw new Error('Missing session object.')
    }

    if (session.firstRender) {
      session.elementChain = [reactChainProvider]
      this.middlewareChain.forEach(middleware => {
        const createElement = middleware(session.public)
        if (createElement) {
          session.elementChain.push(createElement)
        }
      })
      session.firstRender = false
    }

    let index = 0
    const next = (): Promise<any> => {
      const createElement = session.elementChain[index++]
      const renderChildren = session.elementChain[index]
        ? next
        : () => Promise.resolve(null)
      return Promise.resolve(createElement(renderChildren, session.public))
    }

    return await next()
  }

  renderBrowser(session: InternalSessionT, onRender: () => void) {
    render(session, 'browser')(onRender)
  }

  renderServer(session: InternalSessionT, onRender: Function) {
    let body = ''
    render(session, 'server')(() => {
      body = onRender()
    })
    return body
  }
}

export { default as renderClient } from './render/RenderClient'
export { default as renderServer } from './render/RenderServer'

export default function createReactChain() {
  return new ReactChain()
}
