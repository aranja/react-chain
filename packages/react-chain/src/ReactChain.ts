import createSession, { SessionT } from './Session'
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
  (session: SessionT) =>
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

  async getElement(session?: SessionT): Promise<any> {
    if (session == null) {
      throw new Error('Missing session object.')
    }

    if (session.__firstRender) {
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

  async renderBrowser(session: SessionT, onRender: (element: ReactElement<any>) => void) {
    const element = await this.getElement(session)
    render(session, 'browser')(() => {
      onRender(element)
    })
  }

  async renderServer(session: SessionT, onRender: (element: ReactElement<any>) => string) {
    const element = await this.getElement(session)
    let body = ''
    render(session, 'server')(() => {
      body = onRender(element)
    })
    return body
  }
}

export { default as startClient } from './startClient'

export default function createReactChain() {
  return new ReactChain()
}
