import * as React from 'react'
import { createBrowserHistory, createMemoryHistory } from 'history'

const ContextType = {
  history: React.PropTypes.object.isRequired,
}

export class HistoryProvider extends React.Component<any, any> {
  static propTypes = {
    context: React.PropTypes.shape(ContextType).isRequired,
    children: React.PropTypes.element.isRequired,
  }

  static childContextTypes = ContextType

  getChildContext() {
    return this.props.context
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

const history = () => ({
  async createElement(renderChildren: Function, context: any) {
    let { history } = context

    if (!history) {
      if (context.request) {
        history = createMemoryHistory(context.request.url)
      } else {
        history = createBrowserHistory()
        history.listen(() => {
          context.refresh()
        })
      }

      context.history = history
    }

    const children = await renderChildren()
    return (
      <HistoryProvider context={{ history }}>
        {children}
      </HistoryProvider>
    )
  }
})

export default history
