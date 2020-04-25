import { createTransformer } from 'mobx-utils'

export function transformer(target, key, descriptor) {
  const fn = target[key]
  target.$transformerId = target.$transformerId || Math.random()
  target.$transformed = target.$transformed || {}
  descriptor.value = function(...args) {
    if (!target.$transformed[key]) {
      target.$transformed[key] = createTransformer(fn.bind(this))
    }
    return target.$transformed[key](...args)
  }
  descriptor.writable = false
  return descriptor
}

export function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((result, arr) => result.concat(arr), [])
}

export function unique<T>(arr: T[], compare: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
  return arr.filter((value, index, self) => self.findIndex(other => compare(value, other)) === index)
}