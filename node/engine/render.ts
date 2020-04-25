import React from 'react'
import { Node, NodeIdentifier, NodeDefinition, ValueType, Scope, Context, Connection } from '@engine/types'
import { outputs, children } from '@engine/tree'
import { computedFunction } from '@engine/util'

import { matchInto, unionAll } from '@engine/type-functions'

export const nodeDefinition = computedFunction(function(node: NodeIdentifier, context: Context): NodeDefinition {
  return context.modules[node.module]
    ? context.modules[node.module].Node[node.type]
    : context.modules.Error.Node.ModuleNotFound
})

export const value = computedFunction(function(node: Node, scope: Scope, key: string): any {
  return nodeDefinition(node, scope.context).value(node, scope, key)
})

export const inputValue = computedFunction(function(node: Node, key: string, scope: Scope): any {
  return node.connections.input[key]
    && node.connections.input[key][0]
    && value(node.connections.input[key][0].src.node, scope, node.connections.input[key][0].src.key)  
})

export const unmatchedType = computedFunction(function(node: Node, context: Context, key: string): ValueType {
  if (context.types[node.id]) {
    return context.types[node.id]
  }

  const newContext = {
    ...context,
    types: {
      ...context.types,
      [node.id]: context.modules.Core.Type.Unresolved.create()
    }
  }

  const definitions = nodeDefinition(node, context)
  return matchInto(
    definitions.type.output![key](node, newContext),
    unionAll(outputs(node).map(
      target => expectedType(target.node, target.key, newContext)),
    newContext),
    newContext
  )
})

export const type = computedFunction(function(node: Node, context: Context, key: string = 'output'): ValueType {
  return unmatchedType(node, context, key)
})

export const numIterators = computedFunction(function (node: Node): number {
  return Math.max(0, children(node).reduce(
    (sum, child) => numIterators(child) + sum,
    (node.type === 'Items' ? 1 : 0) + (node.type === 'Collect' ? -1 : 0)
  ))
})

export function expectedType(target: Node, key: string, context: Context): ValueType {
  const definitions = nodeDefinition(target, context)
  const input = definitions.type.input

  if (input && input[key]) {
    return definitions.type.input![key](target, context)
  }

  return context.modules.Core.Type.Mismatch.create(`Connection target ${target.type}.id-${target.id} is missingn input key ${key}`)
}
