import Helmet from 'react-helmet'

const helmet = () => (session: any) => {
  session.on('server', (render: Function) => {
    render()
    session.props.helmet = Helmet.rewind()
  })
}

export default helmet
