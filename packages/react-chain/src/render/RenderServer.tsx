import createContext from '../context'
import { ComponentClass, createElement } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { ReactChain } from '../ReactChain'

export interface ServerConfig<DocType> {
  assets?: any,
  Document?: DocType,
}

function renderServer(chain: ReactChain, config: ServerConfig<ComponentClass<any>> = {}) {
  return async function(request?: any, response?: any, next?: Function) {
    const context = createContext({ request, response })
    let html = ''

    if (typeof config.Document === 'undefined') {
      throw new Error()
    }

    try {
      const element = await chain.getElement(context)
      const body = chain.renderServer(context, () => renderToString(element))
      const { htmlProps, request, response, ...rest } = context
      html = renderToStaticMarkup(createElement(config.Document, {
        ...htmlProps,
        assets: config.assets || {},
        context: { ...rest },
      }, body))
    } catch (error) {
      const { htmlProps, request, response, ...rest } = context
      html = renderToStaticMarkup(createElement(config.Document, {
        ...htmlProps,
        assets: config.assets || {},
        context: { ...rest },
        title: 'Internal Server Error',
        description: error.message,
      }, error.toString()))

      response.status(error.status || 500)

      if (typeof next === 'function') {
        next(error)
      }
    }
    response.send(`<!doctype html>${html}`)
  }
}

export default renderServer
