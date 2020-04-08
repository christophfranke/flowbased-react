import React from 'react'
import { Node } from '@engine/types'

import Nodes, { ValueResolver } from '@engine/nodes'
import renderComponent from '@engine/nodes/render-component'


export function value(node: Node): any {
  const resolve = (Nodes[node.type] as ValueResolver).resolve
  return resolve(node)
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

  console.log(node.type, Nodes)
  const type = Nodes[node.type].type
  if (type === 'React.Component') {  
    const Component = Nodes[node.type].resolve
    return React.createElement(renderComponent(Component), { node, parents, key: getRenderKey() })
  }

  if (type === 'Value') {
    return value(node)
  }
}
