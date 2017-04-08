import { ExposedSessionT } from '../Session'
import { ComponentClass, createElement } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { ReactChain } from '../ReactChain'

export type ServerSessionT = ExposedSessionT & {
  req: Request
  res: Response
}

export interface ServerConfig<DocType> {
  assets?: any,
  Document?: DocType,
}

function renderServer(chain: ReactChain, config: ServerConfig<ComponentClass<any>> = {}) {
  return async function (request?: any, response?: any, next?: Function) {
    const session = chain.createSession() as ServerSessionT
    let html = ''

    session.req = request
    session.res = response

    if (typeof config.Document === 'undefined') {
      throw new Error()
    }

    try {
      const element = await chain.getElement(session)
      const body = chain.renderServer(session, () => renderToString(element))
      const { props, req, res, ...rest } = session
      html = renderToStaticMarkup(createElement(config.Document, {
        ...props,
        assets: config.assets || {},
        context: { ...rest },
      }, body))
    } catch (error) {
      const { props, req, res, ...rest } = session
      html = renderToStaticMarkup(createElement(config.Document, {
        ...props,
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
