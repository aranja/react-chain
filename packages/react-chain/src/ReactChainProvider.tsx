import * as React from 'react'
import { AwaitNextT, SessionT } from './types'

export class ReactChainProvider extends React.Component<{
  context: SessionT,
  nextContext?: SessionT,
  children?: any,
}, any> {
  static childContextTypes = {}

  getChildContext() {
    return this.props.nextContext
  }

  render() {
    return this.props.children
  }
}

export default async function createBase(next: AwaitNextT, context: SessionT) {
  return React.createElement(ReactChainProvider, { context }, typeof next === 'function'
    ? await next()
    : null
  )
}
