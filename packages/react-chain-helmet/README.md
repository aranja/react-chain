# react-chain-helmet

A [react-chain](https://github.com/aranja/react-chain) middlware that adds [React Helmet's](https://github.com/nfl/react-helmet) rewind logic to server rendering.

## Usage

Install:

```sh
$ npm install --save react-chain-helmet
```

Add to the project:


```js
// Import to your react-chain initialize module
import helmet from 'react-chain-helmet'

// Add middleware
app.chain(helmet())
```

## Licence
MIT
