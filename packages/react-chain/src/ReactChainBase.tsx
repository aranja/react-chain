import * as React from 'react'
import { Context } from './Context'

export type Props = {
  context: Context<any>,
  nextContext?: Context<any>,
  children?: any,
}

export type RenderChildren =
  null | (() => Promise<React.ReactElement<any>>)

export class ReactChainBase extends React.Component<Props, any> {
  static childContextTypes = {
    htmlProps: React.PropTypes.object.isRequired,
  }

  getChildContext() {
    return this.props.nextContext
  }

  render() {
    return this.props.children
  }
}

async function createBase(renderChildren: RenderChildren, context: Context<any>) {
  const element = renderChildren && await renderChildren()
  return React.createElement(ReactChainBase, { context }, element)
}

export default createBase
