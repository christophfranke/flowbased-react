import React from 'react'
import { Node, ValueType } from '@engine/types'

import Nodes from '@engine/nodes'
import * as TypeDefinition from '@engine/type-definition'
import { matchType } from '@engine/type-functions'


export function value(node: Node): any {
  return Nodes[node.name].resolve(node)
}

export function render(node: Node): any {
  return value(node, reset)
}

export function unmatchedType(node: Node): ValueType {
  return Nodes[node.name].type.output(node)
}

export function type(node: Node): ValueType {
  return node.connections.output.reduce(
    (resultType, connection) => {
      return matchType(resultType, expectedType(connection.node, connection.key))
    },
    unmatchedType(node, reset)
  )
}

export function expectedType(node: Node, key: string = ''): ValueType {
  return key
    ? Nodes[node.name].type.properties[key](node)
    : (Nodes[node.name].type.input
      ? Nodes[node.name].type.input!(node)
      : TypeDefinition.Null)
}
