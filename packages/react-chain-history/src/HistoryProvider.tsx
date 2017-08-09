import * as React from 'react'
import * as PropTypes from 'prop-types'

class HistoryProvider extends React.Component<any, any> {
  static propTypes = {
    history: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired,
  }

  static childContextTypes = {
    history: PropTypes.object.isRequired,
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
