import React from 'react'
import { computedFn } from 'mobx-utils'
import { Node, ValueType, Scope, Context, Connection } from '@engine/types'

import { matchInto, unionAll } from '@engine/type-functions'

export const value = computedFn(function(node: Node, scope: Scope, key: string = ''): any {
  return scope.context.definitions.Node[node.name].value(node, scope, key)
})

export const unmatchedType = computedFn(function(node: Node, context: Context, key: string = ''): ValueType {
  return context.definitions.Node[node.name].type.output![key || 'output'](node, context)
})

export const type = computedFn(function(node: Node, context: Context): ValueType {
  return matchInto(
    unmatchedType(node, context),
    unionAll(node.connections.output.map(
      connection => expectedType(connection, context)),
    context),
    context
  )
})

export const numScopeResolvers = computedFn(function (node: Node): number {
  console.warn('numScopeResolvers not implemented anymore')
  return 0
})

export function expectedType(connection: Connection, context: Context): ValueType {
  const key = connection.target.key
  const target = connection.target.node
  const src = connection.src.node

  return context.definitions.Node[target.name].type.input![key](target, context)
}
