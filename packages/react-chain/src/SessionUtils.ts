import { RenderTargetT, SessionT, WrapRenderCallT } from './types'

export function getChainForTarget(
  session: SessionT,
  target?: RenderTargetT,
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

export function renderRecursively(wrappers: WrapRenderCallT[], onComplete: Function) {
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

export function render(session: SessionT, target: RenderTargetT) {
  const chain = getChainForTarget(session, target)
  return (onComplete = () => {}) => renderRecursively(chain, onComplete)
}
