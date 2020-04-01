import React from 'react'
import { Node } from '@engine/types'

import Nodes from '@engine/nodes'
import renderComponent from '@engine/nodes/render-component'


export function value(node: Node): any {
  const fn = Nodes[node.type].value
  return fn(node)
}

let currentRenderId = 0
function getRenderKey(): number {
  currentRenderId += 1
  return currentRenderId
}

export function render(node: Node, parents: Node[] = []): React.ReactElement {
  if (parents.includes(node)) {
    return React.createElement('div', { key: getRenderKey() }, 'Stopped rendering circular dependency')
  }

  const Component = Nodes[node.type].render
  return React.createElement(renderComponent(Component), { node, parents, key: getRenderKey() })
}
