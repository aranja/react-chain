import { WrapRender, RenderTarget } from './ReactChain'

class Session {
  private browserChain: WrapRender[] = []
  private serverChain: WrapRender[] = []

  public props: any = {}
  public window: any = {}

  public req?: Request
  public res?: Response
  public refresh?: Function

  on(target: RenderTarget, render: WrapRender) {
    switch (target) {
      case 'browser':
        this.browserChain.push(render)
        break
      case 'server':
        this.serverChain.push(render)
        break
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

    function render() {
      const wrap = wrappers[index++]
      const next = wrappers[index] == null ? onComplete : render
      wrap(next)
    }

    render()
  }

  render(target: RenderTarget, onComplete: Function) {
    const chain = target === 'browser'
      ? this.browserChain
      : this.serverChain
    this.renderWrapper(chain, onComplete)
  }
}

export default Session
