import { WrapRender, RenderTarget } from './ReactChain'

class Session {
  private browserChain: WrapRender[] = []
  private serverChain: WrapRender[] = []

  public props: any = {}
  public window: any = {}

  public req?: Request
  public res?: Response
  public refresh?: Function

  on(target?: RenderTarget, render?: WrapRender) {
    const chain = this.getChainForTarget(target)
    if (typeof render !== 'function') {
      throw new Error('session.on: render should be a function.')
    }
    chain.push(render)
  }

  private getChainForTarget(target?: RenderTarget) {
    switch (target) {
      case 'browser':
        return this.browserChain
      case 'server':
        return this.serverChain
      default:
        throw new Error(
          `session.on: '${target}' is an invalid render target, ` +
          `it needs to be set to either 'browser' or 'server'.`
        )
    }
  }

  private renderWrapper(wrappers: WrapRender[], onComplete: Function) {
    let index = 0

    if (wrappers.length === 0) {
      onComplete()
      return
    }

    let didCallRenderers = false
    const wrappedComplete = () => {
      didCallRenderers = true
      return onComplete.apply(null, arguments)
    }

    function next() {
      const wrap = wrappers[index++]
      const callback = wrappers[index] == null ? wrappedComplete : next
      wrap(callback)
    }

    next()

    if (!didCallRenderers) {
      throw new Error(
        `session.on: some render wrapper didn't call 'render()'.`
      )
    }
  }

  render(target: RenderTarget, onComplete: Function) {
    const chain = target === 'browser'
      ? this.browserChain
      : this.serverChain
    this.renderWrapper(chain, onComplete)
  }
}

export default Session
