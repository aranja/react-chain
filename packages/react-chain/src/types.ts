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
  (render: () => {}) =>
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
  htmlProps: { [key: string]: string }
  bodyProps: { [key: string]: string }
  window: { [key: string]: any }
  head: ReactElement<any>[]
  footer: ReactElement<any>[]
  css: string[]
  js: string[]
  refresh?(onComplete?: (element: Element) => void): void
  req?: any
  res?: any
}
