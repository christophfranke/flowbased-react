import { ValueType } from '@engine/types'

export function describe(type: ValueType): string {
  return type.display.split(/(\{.*\})/)
    .map(match => {
      if (match[0] === '{' && match[match.length - 1] === '}') {
        const key = match.substring(1, match.length - 1)
        if (!key) {
          if (Object.entries(type.params).length > 0) {          
            return "{ " 
              + Object.entries(type.params).map(([key, type]) => `${key}: ${describe(type)}`).join(', ')
              + " }"
          }
          return '{}'
        } else if (type.params[key]) {
          return describe(type.params[key])
        } else {
          return `{"${key}" not found}`
        }
      } else {
        return match
      }
    }).join('')
}