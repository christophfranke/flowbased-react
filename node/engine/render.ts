import React from 'react'
import { Node, NodeIdentifier, NodeDefinition, ValueType, Scope, Context, Connection } from '@engine/types'
import { outputs, children, inputAt, inputsAt } from '@engine/tree'
import { computedFunction } from '@engine/util'

import { matchInto, unionAll, createEmptyValue } from '@engine/type-functions'

export const nodeDefinition = computedFunction(function(node: NodeIdentifier, context: Context): NodeDefinition {
  return context.modules[node.module]
    ? context.modules[node.module].Node[node.type]
    : context.modules.Error.Node.ModuleNotFound
})

export const inputValueAt = computedFunction(function(node: Node, key: string, scope: Scope): any {
  const input = inputAt(node, key)
  return input
    ? value(input.node, scope, input.key)
    : createEmptyValue(expectedType(node, key, scope.context), scope.context)
})

export const inputValuesAt = computedFunction(function(node: Node, key: string, scope: Scope): any {
  return inputsAt(node, key).map(input => value(input.node, scope, input.key))
})

export const inputTypeAt = computedFunction(function(node: Node, key: string, context: Context): ValueType {
  const input = inputAt(node, key)
  return input
    ? deliveredType(input.node, input.key, context)
    : context.modules.Core.Type.Unresolved.create()
})

export const value = computedFunction(function(node: Node, scope: Scope, key: string): any {
  return nodeDefinition(node, scope.context).value(node, scope, key)
})

export const deliveredType = computedFunction(function(node: Node, key: string, context: Context): ValueType {
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
    unionAll(outputs(node, key).map(
      target => expectedType(target.node, target.key, newContext)),
    newContext),
    newContext
  )
})

export const numIterators = computedFunction(function (node: Node): number {
  const visited = {}

  const iteratorsOfChildren = (current: Node): number => {
    visited[current.id] = true
    const max = children(current)
      .filter(child => !visited[child.id])
      .reduce(
        (max, child) => Math.max(iteratorsOfChildren(child), max),
        0
      )

    return (current.type === 'Items' ? 1 : 0) + (current.type === 'Collect' ? -1 : 0) + max
  }

  return iteratorsOfChildren(node)
})

export const expectedType = computedFunction(function(target: Node, key: string, context: Context): ValueType {
  const definitions = nodeDefinition(target, context)
  const input = definitions.type.input

  if (input && input[key]) {
    return definitions.type.input![key](target, context)
  }

  return context.modules.Core.Type.Mismatch.create(`Connection target ${target.type}.id-${target.id} is missingn input key ${key}`)
})
