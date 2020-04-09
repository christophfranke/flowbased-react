import React from 'react'
import { Node, ValueType } from '@engine/types'

import Nodes, { ValueResolver } from '@engine/nodes'
import renderComponent from '@engine/nodes/render-component'
import * as TypeDefinition from '@engine/type-definition'
import { matchType } from '@engine/type-functions'


// TODO: add loop protection to value
export function value(node: Node): any {
  const resolve = (Nodes[node.name] as ValueResolver).resolve
  return resolve(node)
}

export function react(node: Node, parents: Node[]): any {
  const Component = renderComponent(Nodes[node.name].resolve)
  return React.createElement(Component, { node, parents, key: getRenderKey() })
}

export function unmatchedType(node: Node): ValueType {
  return Nodes[node.name].type.output(node)
}

export function type(node: Node): ValueType {
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

let currentRenderId = 0
function getRenderKey(): number {
  currentRenderId += 1
  return currentRenderId
}

export function render(node: Node, parents: Node[] = []) {
  if (parents.includes(node)) {
    return React.createElement('div', { key: getRenderKey() }, 'Stopped rendering circular dependency')
  }

  const renderFunction = Nodes[node.name].renderFunction
  if (renderFunction === 'React.Component') {
    return react(node, parents)
  }

  if (renderFunction === 'Value') {
    //TODO: Find a more decent solution
    return JSON.stringify(value(node))
  }
}
