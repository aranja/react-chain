import * as React from 'react'
import { SessionT } from './Session'

export type Props = {
  context: SessionT,
  nextContext?: SessionT,
  children?: any,
}

export type RenderChildren =
  null | (() => Promise<React.ReactElement<any>>)

export class ReactChainProvider extends React.Component<Props, any> {
  static childContextTypes = {
    htmlProps: React.PropTypes.object.isRequired,
    headProps: React.PropTypes.object.isRequired,
    window: React.PropTypes.object.isRequired,
  }

  getChildContext() {
    return this.props.nextContext
  }

  render() {
    return this.props.children
  }
}


export default async function createBase(next: RenderChildren, context: SessionT) {
  const element = next && await next()
  return React.createElement(ReactChainProvider, { context }, element)
}
