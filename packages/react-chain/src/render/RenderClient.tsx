import { render } from 'react-dom'
import Session from '../Session'
import { ReactChain } from '../ReactChain'

function startClient(chain: ReactChain, domNode: Element) {
  const session = new Session()

  console.log('startClient');


  async function refresh(onComplete?: Function) {
    console.log('refresh');

    const element = await chain.getElement(session)
    return await chain.renderBrowser(session, () => {
      console.log('on render');
      if (onComplete) {
        render(element, domNode, onComplete)
      } else {
        render(element, domNode)
      }
    })
  }

  session.refresh = refresh
  return refresh()
}

export default startClient
