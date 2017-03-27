import createContext, { Context } from './Context'
import createBase from './ReactChainBase'
import { ReactElement } from 'react'

export type WrapElement =
  (renderChildren: () => Promise<null | ReactElement<any>>, context: Context<any>) =>
    Promise<ReactElement<any>>

export type WrapRender =
  (render: Function, context: Context<any>) =>
    void

export interface Middleware {
  createElement?: WrapElement
  wrapClientRender?: WrapRender
  wrapServerRender?: WrapRender
}

export class ReactChain {
  protected elementChain: Array<WrapElement> = []
  protected clientChain: Array<WrapRender> = []
  protected serverChain: Array<WrapRender> = []

  chain(middleware: WrapElement | Middleware) {
    if (typeof middleware === 'function') {
      middleware = {
        createElement: middleware,
      }
    }

    if (middleware.createElement) {
      if (typeof middleware.createElement !== 'function') {
        throw new Error('[chain()] createElement should be a function.')
      }
      this.elementChain.push(middleware.createElement)
    }

    if (middleware.wrapClientRender) {
      if (typeof middleware.wrapClientRender !== 'function') {
        throw new Error('[chain()] wrapClientRender should be a function.')
      }
      this.clientChain.push(middleware.wrapClientRender)
    }

    if (middleware.wrapServerRender) {
      if (typeof middleware.wrapServerRender !== 'function') {
        throw new Error('[chain()] wrapServerRender should be a function.')
      }
      this.serverChain.push(middleware.wrapServerRender)
    }

    return this
  }

  async getElement(context = createContext({})): Promise<ReactElement<any>> {
    const elementChain = [createBase, ...this.elementChain]
    let index = 0

    async function next(): Promise<any> {
      const createElement = elementChain[index++]
      const renderChildren = elementChain[index]
        ? await next
        : () => Promise.resolve(null)
      return createElement(renderChildren, context)
    }

    return await next()
  }

  renderClient(context: Context<any>, onRender: Function) {
    return new Promise(resolve => {
      this.renderWrapper(this.clientChain, context, () => {
        onRender()
        resolve()
      })
    })
  }

  renderServer(context: Context<any>, onRender: Function) {
    let body: string = ''
    this.renderWrapper(this.serverChain, context, () => {
      body = onRender()
    })
    return body
  }

  private renderWrapper(
    wrappers: Array<WrapRender>,
    context: Context<any>,
    onComplete: () => void
  ) {
    let index = 0

    if (wrappers.length === 0) {
      onComplete()
      return
    }

    function render() {
      const wrap = wrappers[index++]
      wrap(wrappers[index] == null ? onComplete : render, context)
    }

    render()
  }
}

export default function createReactChain() {
  return new ReactChain()
}
