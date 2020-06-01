import { observable } from 'mobx'
import { Scope, Context, Node, ValueType } from '@engine/types'


export function subContext(context: Context): Context {
  return observable({
    ...context,
    types: {
      ...context.types
    }
  })
}

export function setType(context: Context, node: Node, key: string, type: ValueType) {
  context.types[node.id] = {
    ...(context.types[node.id] || {}),
    [key]: type
  }
}

export function subScope(scope: Scope) {
  return {
    ...scope,
    context: subContext(scope.context)
  }
}