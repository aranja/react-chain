import Helmet from 'react-helmet'

const helmet = () => (session: any) => {
  session.on('server', (render: Function) => {
    render()
    session.headProps.helmet = Helmet.rewind()
  })
}

export default helmet
