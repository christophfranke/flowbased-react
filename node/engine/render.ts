import React from 'react'
import { Node, ValueType } from '@engine/types'

import Nodes, { ValueResolver } from '@engine/nodes'
import renderComponent from '@engine/nodes/render-component'


// TODO: add loop protection to value
export function value(node: Node): any {
  const resolve = (Nodes[node.type] as ValueResolver).resolve
  return resolve(node)
}

export function react(node: Node, parents: Node[]): any {
  const Component = renderComponent(Nodes[node.type].resolve)
  return React.createElement(Component, { node, parents, key: getRenderKey() })
}

export function type(node: Node): ValueType {
  return Nodes[node.type].type(node)
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

  const renderFunction = Nodes[node.type].renderFunction
  if (renderFunction === 'React.Component') {
    return react(node, parents)
  }

  if (renderFunction === 'Value') {
    return value(node)
  }
}
