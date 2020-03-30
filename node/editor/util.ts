import { Connector, Node } from '@editor/types'
import store from '@editor/store'

let id = 0
export const uid:() => number = () => {
  id += 1
  return id
}

export const isServer = typeof window === 'undefined'

export function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((result, arr) => result.concat(arr), [])
}
