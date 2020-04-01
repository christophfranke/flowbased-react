import { Connector, Node } from '@editor/types'
import store from '@editor/store'

export const uid:() => number = () => {
  return store.uid()
}

export const isServer = typeof window === 'undefined'

export function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((result, arr) => result.concat(arr), [])
}
