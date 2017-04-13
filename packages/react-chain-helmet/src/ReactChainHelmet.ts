import Helmet from 'react-helmet'
import { Middleware } from 'react-chain/lib/ReactChain'
import { SessionT } from 'react-chain/lib/Session'
import { HelmetData } from 'react-helmet'

const helmet = (): Middleware => (session: SessionT & {
  helmet: HelmetData,
}) => {
  session.on('server', render => {
    render()
    session.helmet = Helmet.renderStatic()
  })
}

export default helmet
