import * as React from 'react'
import createBrowserHistory from 'history/createBrowserHistory'
import createMemoryHistory from 'history/createMemoryHistory'
import HistoryProvider from './HistoryProvider'

const history = () => (session: any) => {
  let history: any

  if (session.req) {
    history = createMemoryHistory()
  } else {
    history = createBrowserHistory()
    history.listen(() => {
      session.refresh()
    })
  }

  session.history = history

  return async (next: () => any) => {
    const children = await next()
    return (
      <HistoryProvider history={history}>
        {children}
      </HistoryProvider>
    )
  }
}

export default history
