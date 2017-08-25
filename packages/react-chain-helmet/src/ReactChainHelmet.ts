import Helmet from 'react-helmet'
import { HelmetData } from 'react-helmet'
import { Middleware, Session } from 'react-chain'

const helmet = (): Middleware => (session: Session & {
  helmet: HelmetData,
}) => {
  session.on('server', render => {
    render()
    session.helmet = Helmet.renderStatic()
  })
}

export default helmet
