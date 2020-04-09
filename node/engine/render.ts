import React from 'react'
import { Node, ValueType } from '@engine/types'

import Nodes from '@engine/nodes'
import * as TypeDefinition from '@engine/type-definition'
import { matchType } from '@engine/type-functions'


// TODO: add loop protection to value
export function value(node: Node, parents: Node[] = []): any {
  if (parents.includes(node)) {
    throw new Error('Detected circular dependency, rendering chaing is breaking up now')
  }

  return Nodes[node.name].resolve(node)
}

export function render(node: Node, parents: Node[] = []): any {
  return value(node, parents)
}

export function unmatchedType(node: Node): ValueType {
  return Nodes[node.name].type.output(node)
}

export function type(node: Node, parents: Node[] = []): ValueType {
  if (parents.includes(node)) {
    return TypeDefinition.Circular
  }

  return node.connections.output.reduce(
    (resultType, connection) => {
      return matchType(resultType, expectedType(connection.node, connection.key))
    },
    Nodes[node.name].type.output(node)
  )
}

export function expectedType(node: Node, key: string = ''): ValueType {
  return key
    ? Nodes[node.name].type.properties[key](node)
    : (Nodes[node.name].type.input
      ? Nodes[node.name].type.input!(node)
      : TypeDefinition.Null)
}
