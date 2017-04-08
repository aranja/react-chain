import * as React from 'react'
import { ExposedSessionT } from './Session'

export type Props = {
  context: ExposedSessionT,
  nextContext?: ExposedSessionT,
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

async function createBase(renderChildren: RenderChildren, context: ExposedSessionT) {
  const element = renderChildren && await renderChildren()
  return React.createElement(ReactChainBase, { context }, element)
}

export default createBase
