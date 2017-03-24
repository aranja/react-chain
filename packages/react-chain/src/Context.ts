export type Context<T> = {
  htmlProps : any
  refresh? : (onComplete : () => void) =>
    Promise<any>
} & T

function createContext<Config>(newContext: Config | Object = {}): Context<any> {
  let context = { htmlProps: {} }
  if (typeof newContext === 'object') {
    context = Object.assign(context, newContext)
  }
  return context
}

export default createContext
