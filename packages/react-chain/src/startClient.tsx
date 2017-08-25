import { render } from 'react-dom'
import { ReactChain } from './ReactChain'

function startClient(chain: ReactChain, domNode: Element) {
  const session = chain.createSession()

  async function refresh(onComplete?: (element: Element) => void) {
    return await chain.renderBrowser(session, element => {
      render(element, domNode, onComplete)
    })
  }

  session.refresh = refresh

  return refresh()
}

export default startClient
