import { ValueType } from '@engine/types'

export function describe(type: ValueType): string {
  return type.display.split(/(\{.*\})/)
    .map(match => {
      if (match[0] === '{' && match[match.length - 1] === '}') {
        console.warn('type description not complete yet')
        return match
      } else {
        return match
      }
    }).join('')
}