import { render } from 'react-dom'
import { ReactChain } from './ReactChain'

function startClient(chain: ReactChain, domNode: Element) {
  const session = chain.createSession()

  async function refresh(onComplete?: Function) {
    return await chain.renderBrowser(session, element => {
      // Note: Typecasting to avoid weird, incorrect type checks.
      render(element as any, domNode as any, onComplete as any)
    })
  }

  session.refresh = refresh

  return refresh()
}

export default startClient
