<img src="images/react chain logo.png" width="50%">

[![CircleCI](https://img.shields.io/circleci/project/github/aranja/react-chain.svg)](https://circleci.com/gh/aranja/react-chain) [![Greenkeeper badge](https://badges.greenkeeper.io/aranja/react-chain.svg)](https://greenkeeper.io/) [![codecov](https://codecov.io/gh/aranja/react-chain/branch/master/graph/badge.svg)](https://codecov.io/gh/aranja/react-chain)

react-chain simplifies the process of bootstraping browser, and server rendered React applications with a shared middleware chain. It allows developers to share custom logic with both rendering targets, as well as targeting either one specifically. Additionally, some parts of the browser’s rendering process need only happen once, therefore react-chain middleware is designed around the concept of sessions. Each session wraps the rendering of the app. This allows us to run setup code ahead of, or after the inital, or continous, render process.

> **Note:** react-chain is in active development and the API is subject to change drastically before it hits version `1.0.0`.

# Usage

Install as dependency, using the package manager of your choice:

```sh
npm install --save react-chain
```

Create a new file, _app.js_, and add the following code to it:
```js
// app.js

import React from 'react'
import createReactChain from 'react-chain'

export default createReactChain()
  .chain(() => <div>Hello ReactChain!</div>)
```

`createReactChain()` will instantiate a new ReactChain instance that can be used to link middleware and perform render on. The example above creates a very simple middleware chain that ends with a middleware that renders a `div`, containing the string `Hello ReactChain!`. Note that the resulting React element returned from a render is wrapped with an instance of `ReactChainProvider`, which gives us access to custom logic which we see later.

## Middleware

A react-chain comprises a chain of middleware, that have the following API (typescript type definitions):

```ts
type Middleware =
  (session: Session) =>
    (void | WrapElement)
    
type WrapElement =
  (next: () => Promise<null | ReactElement<any>>) =>
    ReactElement<any> | Promise<ReactElement<any>>
```

The `session` object that is passed to the middleware has the following API:

```ts
interface Session {
  on: OnRender
  htmlProps: any
  headProps: any
  window: any
}

type OnRender = 
  (target: 'browser' | 'server' , render: WrapRender)
    => void

type WrapRender =
  (render: Function) =>
    void
```

### Official Middleware

- [react-chain-helmet](packages/react-chain-helmet): Adds rewind logic to server rendering using [React Helmet](https://github.com/nfl/react-helmet).
- [react-chain-history](packages/react-chain-history): A middlware for [history](https://github.com/reacttraining/history).

## Render

### Browser

react-chain exposes a handy method, called `startClient`, which accepts two arguments, a react-chain instance, and a dom node to render the app in. This method wraps `ReactDOM.render` and adds a refresh method to the session, allowing middleware to trigger a rerender of the application.

**Example:**
```js
// index.js

import app from './app' // <-- the previously create react-chain application.
import { startClient } from 'react-chain'

startClient(app, document.querySelector('#app'))
```

### Server-side rendering

Server rendering requires a bit more configuration and thus we do not ship a rendering method in this version. This may, or may not change in the future.

**Example:**
```js
// server.js

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import express from 'express'
import Document from 'react-document'
import app from  './app' // <-- the previously create react-chain application.

const server = express()

server.use('*', async function (req, res, next) {
  const session = app.createSession()

  let body = ''
  let element

  session.req = req
  session.res = res

  try {
    body = await app.renderServer(session, element => {
      return ReactDOMServer.renderToString(element)
    })
    
    res.status(session.status || 200)
  } catch (error) {
    session.title = 'Internal Server Error'
    
    body = error.toString()
    
    next(error)
  }

  const html = '<!doctype html>' + ReactDOMServer.renderToStaticMarkup(
    <Document {...session}>{body}</Document>
  )

  response.send(html)
})

server.listen(3000)
```
