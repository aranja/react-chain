import * as Helmet from 'react-helmet'

const helmet = () => (session: any) => {
  session.wrapServer(render => {
    render()
    session.props.helmet = Helmet.rewind()
  })
}

export default helmet
