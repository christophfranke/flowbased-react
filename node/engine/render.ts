import React from 'react'
import { computedFn } from 'mobx-utils'
import { Node, ValueType, Scope } from '@engine/types'

import Nodes from '@engine/nodes'
import * as TypeDefinition from '@engine/type-definition'
import { matchInto, unionAll } from '@engine/type-functions'
import { setStaticGlobalScope, entries } from '@engine/scopes'

export const value = computedFn(function(node: Node, scope: Scope): any {
  if (!Nodes[node.name]) {
    console.log(node, scope)
  }
  return Nodes[node.name].resolve(node, scope)
})

// this function is for api only
export const render = function(node: Node, globalScope: Scope): any {
  setStaticGlobalScope(globalScope)
  return value(node, globalScope)
}

export const unmatchedType = computedFn(function(node: Node): ValueType {
  return Nodes[node.name].type.output(node)
})

export const type = computedFn(function(node: Node): ValueType {
  return matchInto(
    unmatchedType(node),
    unionAll(node.connections.output.map(
      connection => expectedType(connection.node, connection.key, node)))
  )
})

export const numScopeResolvers = computedFn(function (node: Node): number {
  return entries(node).length
})

export function expectedType(node: Node, key: string = '', other?: Node): ValueType {
  return key
    ? Nodes[node.name].type.properties[key](node, other)
    : (Nodes[node.name].type.input
      ? Nodes[node.name].type.input!(node, other)
      : TypeDefinition.Null)
}
