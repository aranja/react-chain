import * as React from 'react'
import { AwaitNext, Session } from './types'

export class ReactChainProvider extends React.Component<{
  context: Session,
  nextContext?: Session,
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

export default async function createBase(next: AwaitNext, context: Session) {
  return React.createElement(ReactChainProvider, { context }, typeof next === 'function'
    ? await next()
    : null
  )
}
