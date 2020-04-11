import { createTransformer } from 'mobx-utils'

export function transformer(target, key, descriptor) {
  let fn = target[key]
  let isTransformed = false
  descriptor.value = function(...args) {
    if (!isTransformed) {
      fn = createTransformer(fn.bind(this))
      isTransformed = true
    }
    return fn(...args)
  }
  return descriptor
}

export function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((result, arr) => result.concat(arr), [])
}

export function unique<T>(arr: T[], compare: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
  return arr.filter((value, index, self) => self.findIndex(other => compare(value, other)) === index)
}