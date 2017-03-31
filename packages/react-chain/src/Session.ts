import { WrapRender, RenderTarget, WrapElement } from './ReactChain'
import { getChainForTarget } from './SessionUtils'

class Session {
  __browserChain: WrapRender[] = []
  __serverChain: WrapRender[] = []
  __elementChain: WrapElement[] = []
  __firstRender = true

  props: any = {}
  window: any = {}

  req?: Request
  res?: Response
  refresh?: Function

  on(target?: RenderTarget, render?: WrapRender) {
    const chain = getChainForTarget(this, target)
    if (typeof render !== 'function') {
      throw new Error('session.on: render should be a function.')
    }
    chain.push(render)
  }
}

export default Session
