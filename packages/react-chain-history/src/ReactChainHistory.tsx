import * as React from 'react'
import createBrowserHistory from 'history/createBrowserHistory'
import createMemoryHistory from 'history/createMemoryHistory'
import HistoryProvider from './HistoryProvider'
import { SessionT } from 'react-chain/lib/Session'
import { History } from 'history'

export default () => (session: SessionT & {
  history: History
}) => {
  if (session.req) {
    session.history = createMemoryHistory()
  } else {
    session.history = createBrowserHistory()
    session.history.listen(() => {
      if (session.refresh) {
        session.refresh()
      }
    })
  }

  return async (next: () => any) => {
    const children = await next()
    return (
      <HistoryProvider history={session.history}>
        {children}
      </HistoryProvider>
    )
  }
}
