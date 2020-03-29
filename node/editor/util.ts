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

export function canConnect(pending: Connector, possiblyHot: Connector): boolean {
  return pending !== possiblyHot
    && store.nodeOfConnector(pending) !== store.nodeOfConnector(possiblyHot)
    && !(pending.mode === 'multiple' && possiblyHot.mode === 'multiple')
}