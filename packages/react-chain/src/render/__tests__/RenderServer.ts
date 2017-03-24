import renderServer from '../RenderServer'
import createReactChain from '../../ReactChain'
import { ReactChain } from '../../ReactChain'

describe('renderServer()', () => {
  let app: ReactChain

  beforeEach(() => {
    app = createReactChain()
  })

  it('should be callable', () => {
    expect(typeof renderServer).toBe('function')
  })
})
