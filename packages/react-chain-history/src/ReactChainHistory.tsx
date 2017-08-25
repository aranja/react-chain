import * as React from 'react'
import createBrowserHistory from 'history/createBrowserHistory'
import createMemoryHistory from 'history/createMemoryHistory'
import HistoryProvider from './HistoryProvider'
import { History } from 'history'
import { CreateElement, Session, Middleware } from 'react-chain'

export default (): Middleware => (session: Session & {
  history: History
}) => {
  if (session.req) {
    session.history = createMemoryHistory({
      initialEntries: [session.req.url],
    })
  } else {
    session.history = createBrowserHistory()
    session.history.listen(() => {
      if (session.refresh) {
        session.refresh()
      }
    })
  }

  return async next => {
    const children = await next()
    return (
      <HistoryProvider history={session.history}>
        {children}
      </HistoryProvider>
    )
  }
}
