import { Value } from '@engine/types'

export default class StringValue {
  static create(s: string): Value {
    return () => s
  }
}