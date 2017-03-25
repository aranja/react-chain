import * as Helmet from 'react-helmet'

export interface Config {}

export default (config: Config = {}) => ({
  wrapServerRender(render: Function, context: any) {
    render()
    context.htmlProps.helmet = Helmet.rewind()
  }
})
