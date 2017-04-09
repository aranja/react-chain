import { Middleware } from './ReactChain'

const reactChainInitMiddleware: Middleware = session => {
  session.htmlProps = {}
  session.headProps = {}
  session.window = {}
}

export default reactChainInitMiddleware
