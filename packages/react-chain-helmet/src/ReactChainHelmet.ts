import Helmet from 'react-helmet'
import { HelmetData } from 'react-helmet'
import { MiddlewareT, SessionT } from 'react-chain'

const helmet = (): MiddlewareT => (session: SessionT & {
  helmet: HelmetData,
}) => {
  session.on('server', render => {
    render()
    session.helmet = Helmet.renderStatic()
  })
}

export default helmet
