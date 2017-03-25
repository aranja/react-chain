import chainHistory from '../index'
import { HistoryProvider } from '../index'
import { createElement } from 'react'
import { shallow } from 'enzyme'

jest.mock('history')

describe('react-chain-history', () => {
  it('should be a function', () => {
    expect(typeof chainHistory).toBe('function')
  })

  it('should have a createElement promise', () => {
    const middleware = chainHistory()
    expect(middleware).toHaveProperty('createElement')
    expect(typeof middleware.createElement).toBe('function')
  })

  it('should wrap an element in the HistoryProvider', async () => {
    const middleware = chainHistory()
    const app = createElement('div', {}, 'test')
    const element = await middleware.createElement(() => app, {
      refresh: jest.fn(),
    })
    expect(shallow(element).instance()).toBeInstanceOf(HistoryProvider)
  })

  it('should add a history object to the context', async () => {
    const middleware = chainHistory()
    const app = createElement('div', {}, 'test')
    const context = {
      refresh: jest.fn(),
    }

    await middleware.createElement(() => app, context)
    expect(context).toHaveProperty('history')
  })

  it('should call refresh from the context on history change', async () => {
    const middleware = chainHistory()
    const app = createElement('div', {}, 'test')
    const context = {
      refresh: jest.fn(),
    }

    await middleware.createElement(() => app, context)
    expect(context.refresh).toHaveBeenCalled()
  })

  it('should not modify context in second pass', async () => {
    const middleware = chainHistory()
    const app = createElement('div', {}, 'test')
    const context = {
      refresh: jest.fn(),
    }

    await middleware.createElement(() => app, context)
    await middleware.createElement(() => app, context)

    expect(context.refresh).toHaveBeenCalledTimes(1)
  })
})
