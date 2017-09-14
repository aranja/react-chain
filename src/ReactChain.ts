import createSession from './Session'
import { isValidElement, ReactElement } from 'react'
import { validateElementCreator, unfoldRender, renderElementChain } from './utils'
import { Middleware, Session, CreateElement } from './types'
export { Middleware, Session, CreateElement }

export class ReactChain {
  middlewareChain: Array<Middleware> = []

  use(middleware?: ReactElement<any> | Middleware) {
    if (middleware && isValidElement(middleware)) {
      middleware = ((element) => () => () => element)(middleware)
    }
    if (typeof middleware !== 'function') {
      throw new Error('A react-chain middleware should be a function')
    }

    this.middlewareChain.push(middleware)

    return this
  }

  // Deprecated
  chain(middleware?: ReactElement<any> | Middleware) {
    return this.use(middleware)
  }

  createSession = createSession

  async getElement(session?: Session): Promise<any> {
    if (session == null) {
      throw new Error('Missing session object.')
    }

    if (session.__firstRender) {
      this.middlewareChain.forEach(middleware => {
        let createElement: void | CreateElement
        if ((createElement = validateElementCreator(middleware(session)))) {
          session.__elementChain.push(createElement)
        }
      })

      session.__firstRender = false
    }

    return await renderElementChain(session.__elementChain)
  }

  async renderBrowser(session: Session, onRender: (element: ReactElement<any>) => any) {
    const element = await this.getElement(session)
    return unfoldRender(session, 'browser', () => onRender(element))
  }

  async renderServer(session: Session, onRender: (element: ReactElement<any>) => any) {
    const element = await this.getElement(session)
    return unfoldRender(session, 'server', () => onRender(element))
  }
}

export default function createReactChain() {
  return new ReactChain()
}
