import { ReactElement } from 'react'

export type RenderTargetT =
  'browser' |
  'server'

export type AwaitNextT =
  () => Promise<null | ReactElement<any>>

export type CreateElementT =
  (next: AwaitNextT) =>
    ReactElement<any> | Promise<ReactElement<any>>

export type WrapRenderCallT =
  (render: Function) =>
    void

export type MiddlewareT =
  (session: SessionT) =>
    (void | CreateElementT)

export interface SessionT {
  readonly __browserChain: WrapRenderCallT[]
  readonly __serverChain: WrapRenderCallT[]
  readonly __elementChain: CreateElementT[]
  readonly on: (target?: RenderTargetT, render?: WrapRenderCallT) => void
  __firstRender: boolean
  htmlProps: { [key: string]: string }
  bodyProps: { [key: string]: string }
  window: { [key: string]: any }
  head: ReactElement<any>[]
  footer: ReactElement<any>[]
  css: string[]
  js: string[]
  refresh?: Function
  req?: any
  res?: any
}
