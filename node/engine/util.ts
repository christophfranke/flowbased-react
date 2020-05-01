import { computedFn } from 'mobx-utils'

export const computedFunction = computedFn

export function transformer(target, key, descriptor) {
  const fn = target[key]
  descriptor.value = function(...args) {
    if (this) {    
      this.$transformerId = this.$transformerId || Math.random()
      this.$transformed = this.$transformed || {}
      if (!this.$transformed[key]) {
        this.$transformed[key] = computedFn(fn.bind(this))
      }
      return this.$transformed[key](...args)
    }

    return fn(...args)
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