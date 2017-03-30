import { WrapRender, RenderTarget } from "./ReactChain";

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
        throw new Error()
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
      let didCallNext = false
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
