import { autorun } from 'mobx'
import { isServer } from '@editor/util'


export function load(path: string[], unserialize?: (any) => any): any {
  if (isServer) {
    return
  }

  // const key = path.join('.')
  // const value = window.localStorage.getItem(key)
  // if (value) {
  //   try {
  //     if (unserialize) {
  //       return unserialize(JSON.parse(value))
  //     }

  //     return JSON.parse(value)
  //   } catch {
  //     return
  //   }
  // }
}

export function save(path: string[], object: any, key: string, serialize?: (any) => any): void {
  // const storageKey = path.join('.')
  // const value = serialize ? serialize(object[key]) : object[key]
  // window.localStorage.setItem(storageKey, JSON.stringify(value))
}

export function sync(path: string[], object: any, key: string, serialize?: (any) => any): void {
  if (isServer) {
    return
  }

  // const storageKey = path.join('.')
  // autorun(() => {
  //   const value = serialize ? serialize(object[key]) : object[key]
  //   window.localStorage.setItem(storageKey, JSON.stringify(value))
  // }, {
  //   delay: 0
  // })
}