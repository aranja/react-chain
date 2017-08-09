import createSession from './Session'
import { ReactElement } from 'react'
import { validateElementCreator, unfoldRender, renderElementChain } from './utils'
import reactChainProvider from './ReactChainProvider'
import reactChainInitMiddleware from './ReactChainInit'
import { MiddlewareT, SessionT, CreateElementT } from './types'

export { MiddlewareT, SessionT, CreateElementT }

export class ReactChain {
  middlewareChain: Array<MiddlewareT> = [reactChainInitMiddleware]

  chain(middleware?: MiddlewareT) {
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
        let createElement: void | CreateElementT
        if ((createElement = validateElementCreator(middleware(session)))) {
          session.__elementChain.push(createElement)
        }
      })

      session.__firstRender = false
    }

    return await reactChainProvider(renderElementChain(session.__elementChain), session)
  }

  async renderBrowser(session: SessionT, onRender: (element: ReactElement<any>) => void) {
    const element = await this.getElement(session)
    unfoldRender(session, 'browser', () => {
      onRender(element)
    })
  }

  async renderServer(session: SessionT, onRender: (element: ReactElement<any>) => string) {
    const element = await this.getElement(session)
    let body = ''
    unfoldRender(session, 'server', () => {
      body = onRender(element)
    })
    return body
  }
}

export { default as startClient } from './startClient'

export default function createReactChain() {
  return new ReactChain()
}
