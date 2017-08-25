import { AwaitNext, CreateElement, RenderTarget, Session, WrapRenderCall } from './types'
import { isValidElement } from 'react'

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

export function renderElementChain(creators: CreateElement[]) {
  let index = 0
  const next: AwaitNext = () => {
    const createElement = creators[index++] || null
    return Promise.resolve(createElement && createElement(next))
  }
  return next
}

export function validateElementCreator(createElement?: any): void | CreateElement {
  if (createElement == null) {
    return
  }

  const returnType = isValidElement(createElement)
    ? 'ReactElement'
    : typeof createElement

  if (returnType !== 'function') {
    throw new Error(
      `.chain(): A session wrap can return a 'next' ` +
      `function or void, instead returns '${returnType}'.`,
    )
  }

  return createElement
}

export function renderRecursively(wrappers: WrapRenderCall[], onComplete: Function) {
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

export function unfoldRender(session: Session, target: RenderTarget, onComplete = () => {}) {
  const chain = getChainForTarget(session, target)
  renderRecursively(chain, onComplete)
}
