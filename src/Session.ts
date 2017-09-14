import { getChainForTarget } from './utils'
import { RenderTarget, Session, WrapRenderCall } from './types'

export default function(data?: any): Session {
  const session = Object.create({}, {
    __browserChain: { value: [] },
    __serverChain: { value: [] },
    __elementChain: { value: [] },
    __firstRender: { value: true, writable: true },
    on: {
      value(target?: RenderTarget, render?: WrapRenderCall) {
        const chain = getChainForTarget(session, target)

        if (typeof render !== 'function') {
          throw new Error('session.on: render should be a function.')
        }

        chain.push(render)
      },
    }
  })

  return Object.assign(session, data)
}
