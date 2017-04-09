import chainHistory from '../ReactChainHistory'
import HistoryProvider from '../HistoryProvider'
import * as React from 'react'
import { shallow } from 'enzyme'

describe('react-chain-history', () => {
  it('should be a function', () => {
    expect(typeof chainHistory).toBe('function')
  })

  it('should wrap an element in the HistoryProvider', async () => {
    const history = chainHistory()
    const refresh = jest.fn()
    const element = await history({ refresh })(() => <div />)

    expect(shallow(element).instance()).toBeInstanceOf(HistoryProvider)
  })

  it('should add a history object to the context', async () => {
    const history = chainHistory()
    const session = {
      refresh: jest.fn(),
    }

    await history(session)(() => <div />)

    expect(session).toHaveProperty('history')
  })

  describe('browser', () => {
    const render = () => (<div />)
    let history = chainHistory()
    let session: any

    beforeEach(() => {
      history = chainHistory()
      session = { refresh: jest.fn() }
    })

    it('should have a listen method on the history', async () => {
      await history(session)(render)
      expect(session.history).toHaveProperty('listen')
      expect(typeof session.history.listen).toBe('function')
    })

    it('should invoke the session\'s refresh on history change', async () => {
      await history(session)(render)
      expect(session.refresh).toHaveBeenCalled()
    })
  })

  describe('server', () => {
    const render = () => <div />
    let session: any

    beforeEach(() => {
      session = {
        req: {
          url: '',
        }
      }
    })

    it('should add a memory history object to the session', async () => {
      const history = chainHistory()
      await history(session)(render)
      expect(session.history).toBeDefined()
    })
  })
})
