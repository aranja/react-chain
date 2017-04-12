import { WrapRender, RenderTarget, WrapElement } from './ReactChain'
import { getChainForTarget } from './SessionUtils'
import reactChainProvider from './ReactChainProvider'
import { ReactElement } from 'react'

export type ExcessT = Partial<{
  [key: string]: any
}>

export type SessionT = {
  readonly __browserChain: WrapRender[]
  readonly __serverChain: WrapRender[]
  readonly __elementChain: WrapElement[]
  readonly on: (target?: RenderTarget, render?: WrapRender) => void
  __firstRender: boolean
  htmlProps: { [key: string]: string }
  bodyProps: { [key: string]: string }
  window: { [key: string]: any }
  head: ReactElement<any>[]
  footer: ReactElement<any>[]
  css: string[]
  js: string[]
} & ExcessT

export default function(): SessionT {
  const session = Object.create({}, {
    __browserChain: { value: [] },
    __serverChain: { value: [] },
    __elementChain: { value: [reactChainProvider] },
    __firstRender: { value: true, writable: true },
  })

  return Object.defineProperty(session, 'on', {
    value(target?: RenderTarget, render?: WrapRender) {
      const chain = getChainForTarget(session, target)

      if (typeof render !== 'function') {
        throw new Error('session.on: render should be a function.')
      }

      chain.push(render)
    },
  })
}
