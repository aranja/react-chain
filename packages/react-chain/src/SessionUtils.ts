import { WrapRender, RenderTarget } from './ReactChain'
import Session from './Session'

export function getChainForTarget(
  session: Session,
  target?: RenderTarget,
) {
  switch (target) {
    case 'browser':
      return session.__browserChain
    case 'server':
      return session.__serverChain
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

export function render(session: Session, target: RenderTarget) {
  const chain = getChainForTarget(session, target)
  return (onComplete = () => {}) => renderRecursively(chain, onComplete)
}
