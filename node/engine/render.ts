import React from 'react'
import { Node, ValueType, Scope, Context, Connection } from '@engine/types'
import { outputs } from '@engine/tree'
import { computedFunction } from '@engine/util'

import { matchInto, unionAll } from '@engine/type-functions'

export const value = computedFunction(function(node: Node, scope: Scope, key: string): any {
  return scope.context.definitions.Node[node.type].value(node, scope, key)
})

export const unmatchedType = computedFunction(function(node: Node, context: Context, key: string): ValueType {
  return context.definitions.Node[node.type].type.output![key](node, context)
})

export const type = computedFunction(function(node: Node, context: Context, key: string = 'output'): ValueType {
  return matchInto(
    unmatchedType(node, context, key),
    unionAll(outputs(node).map(
      target => expectedType(target.node, target.key, context)),
    context),
    context
  )
})

export const numScopeResolvers = computedFunction(function (node: Node): number {
  console.warn('numScopeResolvers not implemented anymore')
  return 0
})

export function expectedType(target: Node, key: string, context: Context): ValueType {
  return context.definitions.Node[target.type].type.input![key](target, context)
}
