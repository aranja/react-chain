import createSession from './Session'
import { ReactElement, isValidElement } from 'react'
import { render } from './SessionUtils'
import provide from './ReactChainProvider'
import reactChainInitMiddleware from './ReactChainInit'
import { AwaitNextT, MiddlewareT, SessionT } from './types'

const nullNext = () => {
  return Promise.resolve(null)
}

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
        const createElement = middleware(session)
        if (createElement) {
          const returnType = isValidElement(createElement)
            ? 'ReactElement'
            : typeof createElement

          if (returnType !== 'function') {
            throw new Error(
              `.chain(): A session wrap can return a 'next' ` +
              `function or void, instead returns '${returnType}'.`,
            )
          }

          session.__elementChain.push(createElement)
        }
      })

      session.__firstRender = false
    }

    const next = (index = 0): AwaitNextT => () => {
      const createElement = session.__elementChain[index] || nullNext
      return Promise.resolve(createElement(
        session.__elementChain[index]
          ? next(index + 1)
          : nullNext
      ))
    }

    return await provide(next(), session)
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
