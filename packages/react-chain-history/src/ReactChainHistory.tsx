import * as React from 'react'
import createBrowserHistory from 'history/createBrowserHistory'
import createMemoryHistory from 'history/createMemoryHistory'
import HistoryProvider from './HistoryProvider'
import { History } from 'history'
import { CreateElementT, SessionT } from 'react-chain/lib/types'

export default () => (session: SessionT & {
  history: History
}): CreateElementT => {
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

  return async next => {
    const children = await next()
    return (
      <HistoryProvider history={session.history}>
        {children}
      </HistoryProvider>
    )
  }
}
