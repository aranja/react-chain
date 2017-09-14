import { ReactElement } from 'react'

export type RenderTarget =
  'browser' |
  'server'

export type AwaitNext =
  () => Promise<null | ReactElement<any>>

export type CreateElement =
  (next: AwaitNext) =>
    null | ReactElement<any> | Promise<null | ReactElement<any>>

export type WrapRenderCall =
  (render: () => any) =>
    void

export type Middleware =
  (session: Session) =>
    (void | CreateElement)

export interface Session {
  readonly __browserChain: WrapRenderCall[]
  readonly __serverChain: WrapRenderCall[]
  readonly __elementChain: CreateElement[]
  readonly on: (target?: RenderTarget, render?: WrapRenderCall) => void
  __firstRender: boolean
}
