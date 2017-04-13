import { AwaitNextT, CreateElementT, RenderTargetT, SessionT, WrapRenderCallT } from './types'
import { isValidElement } from 'react'

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

export function renderElementChain(creators: CreateElementT[]) {
  let index = 0
  const next: AwaitNextT = () => {
    const createElement = creators[index++] || null
    return createElement && Promise.resolve(createElement(
      creators[index] ? next : () => null
    ))
  }
  return next
}

export function validateElementCreator(createElement?: any): void | CreateElementT {
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
