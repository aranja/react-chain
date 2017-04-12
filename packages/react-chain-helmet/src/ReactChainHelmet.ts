import Helmet from 'react-helmet'
import { Middleware } from 'react-chain/lib/ReactChain'

const helmet = (): Middleware => session => {
  session.on('server', (render: Function) => {
    render()
    session.helmet = Helmet.rewind()
  })
}

export default helmet
