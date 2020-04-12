import React from 'react'
import { Node, ValueType, Scope } from '@engine/types'

import Nodes from '@engine/nodes'
import * as TypeDefinition from '@engine/type-definition'
import { matchType } from '@engine/type-functions'
import { getGlobalScope, entries } from '@engine/scopes'

export function value(node: Node, scope: Scope): any {
  return Nodes[node.name].resolve(node, scope)
}

export function render(node: Node): any {
  return value(node, getGlobalScope())
}

export function unmatchedType(node: Node): ValueType {
  return Nodes[node.name].type.output(node)
}

export function type(node: Node): ValueType {
  return node.connections.output.reduce(
    (resultType, connection) => {
      return matchType(resultType, expectedType(connection.node, connection.key, node))
    },
    unmatchedType(node)
  )
}

export function numScopeResolvers(node: Node): number {
  return entries(node).length
}

export function expectedType(node: Node, key: string = '', other?: Node): ValueType {
  return key
    ? Nodes[node.name].type.properties[key](node, other)
    : (Nodes[node.name].type.input
      ? Nodes[node.name].type.input!(node, other)
      : TypeDefinition.Null)
}
