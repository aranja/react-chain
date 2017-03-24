import * as ReactDOM from 'react-dom'
import createContext from '../context'
import { ReactChain } from '../ReactChain'

function startClient(chain: ReactChain, domNode: Element) {
  const context = createContext()

  async function refresh(onComplete = () => {}) {
    const element = await chain.getElement(context)
    return await chain.renderClient(context, () => {
      ReactDOM.render(element, domNode, onComplete)
    })
  }

  context.refresh = refresh
  return refresh()
}

export default startClient
