import { ComponentClass, createElement, ReactElement } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { ReactChain } from '../ReactChain'

export interface ServerConfig<DocType> {
  assets?: any,
  Document?: DocType,
}

function renderServer(
  chain: ReactChain,
  config: ServerConfig<(() => ReactElement<any>) | ComponentClass<any>> = {}
) {
  if (!config.Document) {
    throw new Error('renderServer requires a Document React component.')
  }

  const { Document, assets = {} } = config

  return async function (request?: any, response?: any, next?: Function) {
    const session = chain.createSession()
    const props: any = { assets }
    let element: ReactElement<any>
    let body = ''

    session.exposed.req = request
    session.exposed.res = response

    try {
      element = await chain.getElement(session)
      body = chain.renderServer(session, () => renderToString(element))
      response.status(session.exposed.status || 200)
    } catch (error) {
      props.title = 'Internal Server Error'
      props.description = error.message
      body = error.toString()
      response.status(error.status || 500)
      if (typeof next === 'function') {
        next(error)
      }
    }

    const { on, ...context } = session.exposed
    const html = renderToStaticMarkup(createElement(
      Document as ComponentClass<any>, { ...props, context }, body,
    ))

    response.send(`<!doctype html>${html}`)
  }
}

export default renderServer
