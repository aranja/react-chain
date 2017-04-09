import renderServer, { ServerConfig } from '../RenderServer'
import * as React from 'react'
import createReactChain from '../../ReactChain'
import { ReactChain } from '../../ReactChain'

describe('renderServer()', () => {
  let app: ReactChain

  beforeEach(() => {
    app = createReactChain()
  })

  it('should throw if no Document is defined', () => {
    expect(() => {
      renderServer(app)
    }).toThrowErrorMatchingSnapshot()
  })

  it('should render a Document', async () => {
    let statusCode = -1
    let html = ''

    const config = {
      Document: () => <html>
      <body><h1>hello</h1></body>
      </html>,
    }
    const res = {
      send(data: string) {
        html = data
      },
      status(code: number) {
        statusCode = code
      },
    }

    await renderServer(app, config)({}, res)

    expect(statusCode).toBe(200)
    expect(html).toEqual(
      `<!doctype html><html><body><h1>hello</h1></body></html>`,
    )
  })

  it('should expose `assets`, `context`, `req` and `res`', async () => {
    let props: any = {}

    const config = {
      Document: (_props: any) => {
        props = _props
        return <div />
      },
    }

    await renderServer(app, config as ServerConfig<any>)({}, {
      status() {},
      send() {},
    })

    expect(props).toHaveProperty('assets')
    expect(props).toHaveProperty('context')
    expect(props.context).toHaveProperty('req')
    expect(props.context).toHaveProperty('res')
    expect(props.context).not.toHaveProperty('on')
  })

  it('should return a 500 on error', async () => {
    let statusCode = -1
    let html = ''

    const config = {
      Document: ({ title, description, children }: any) => (
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
          <div>{children}</div>
        </div>
      ),
    }

    app.getElement = () => {
      throw new Error('Error message goes here...')
    }

    const res = {
      send(data: string) {
        html = data
      },
      status(code: number) {
        statusCode = code
      },
    }

    await renderServer(app, config as ServerConfig<any>)({}, res)

    expect(statusCode).toBe(500)
    expect(html).toMatchSnapshot()
  })

  it('should call next on error', async () => {
    const next = jest.fn()

    const config = {
      Document: () => <div />,
    }

    const res = {
      send() {},
      status() {},
    }

    app.getElement = () => {
      throw new Error('Error message goes here...')
    }

    await renderServer(app, config as ServerConfig<any>)({}, res, next)

    expect(next).toHaveBeenCalled()
  })
})
