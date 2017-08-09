import { MiddlewareT } from './types'

const reactChainInitMiddleware: MiddlewareT = session => {
  Object.defineProperties(session, {
    htmlProps: { enumerable: true, writable: true, value: {} },
    bodyProps: { enumerable: true, writable: true, value: {} },
    window: { enumerable: true, writable: true, value: {} },
    head: { enumerable: true, writable: true, value: [] },
    footer: { enumerable: true, writable: true, value: [] },
    css: { enumerable: true, writable: true, value: [] },
    js: { enumerable: true, writable: true, value: [] },
  })
}

export default reactChainInitMiddleware
