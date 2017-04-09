import { WrapRender, RenderTarget, WrapElement } from './ReactChain'
import { getChainForTarget } from './SessionUtils'

export type OnT =
  (target?: RenderTarget, render?: WrapRender)
    => void

export type ExposedSessionT = any & {
  on: OnT
}

export interface InternalSessionT {
  browserChain: Array<WrapRender>
  serverChain: Array<WrapRender>
  elementChain: Array<WrapElement>
  firstRender: boolean
  public?: ExposedSessionT
  on: OnT
}

export default function() {
  const session: InternalSessionT = {
    browserChain: [],
    serverChain: [],
    elementChain: [],
    firstRender: true,

    on(target?: RenderTarget, render?: WrapRender) {
      const chain = getChainForTarget(this, target)

      if (typeof render !== 'function') {
        throw new Error('session.on: render should be a function.')
      }

      chain.push(render)
    }
  }

  session.public = {
    on: session.on,
  }

  return session
}
