import { render } from 'react-dom'
import { ReactChain } from '../ReactChain'
import { ExposedSessionT } from '../Session'

export type ClientSessionT = ExposedSessionT & {
  refresh: (onComplete?: Function) => Promise<any>
}

function startClient(chain: ReactChain, domNode: Element) {
  const session = chain.createSession() as ClientSessionT

  async function refresh(onComplete?: Function) {
    const element = await chain.getElement(session)

    return await chain.renderBrowser(session, () => {
      // Note: Typecasting to avoid weird, incorrect type checks.
      render(element as any, domNode as any, onComplete as any)
    })
  }

  session.refresh = refresh

  return refresh()
}

export default startClient
