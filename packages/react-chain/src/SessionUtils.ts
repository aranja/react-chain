import { WrapRender, RenderTarget } from './ReactChain'
import { InternalSessionT } from './Session'

export function getChainForTarget(
  session: InternalSessionT,
  target?: RenderTarget,
) {
  switch (target) {
    case 'browser':
      return session.browserChain
    case 'server':
      return session.serverChain
    default:
      throw new Error(
        `'${target}' is not a valid render target. ` +
        `A render target can either be 'browser' or 'server'.`
      )
  }
}

export function renderRecursively(wrappers: WrapRender[], onComplete: Function) {
  let index = 0

  if (wrappers.length === 0) {
    onComplete()
    return
  }

  let didCallRenderers = false

  function wrappedComplete() {
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

export function render(session: InternalSessionT, target: RenderTarget) {
  const chain = getChainForTarget(session, target)
  return (onComplete = () => {}) => renderRecursively(chain, onComplete)
}
