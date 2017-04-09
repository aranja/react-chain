import * as React from 'react'

class HistoryProvider extends React.Component<any, any> {
  static propTypes = {
    history: React.PropTypes.object.isRequired,
    children: React.PropTypes.element.isRequired,
  }

  static childContextTypes = {
    history: React.PropTypes.object.isRequired,
  }

  getChildContext() {
    return {
      history: this.props.history,
    }
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

export default HistoryProvider
