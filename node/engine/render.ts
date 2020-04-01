import React from 'react'
import { Node } from '@engine/types'

import Nodes from '@engine/nodes'
import withChildren from '@engine/nodes/with-children'


export function value(node: Node): any {
  const fn = Nodes[node.type].value
  return fn(node)
}

let currentRenderId = 0
function getRenderKey(): number {
  currentRenderId += 1
  return currentRenderId
}

export function render(node: Node): React.ReactElement {
  console.log('create ----------', node.id)
  const Component = Nodes[node.type].render
  return React.createElement(withChildren(Component), { node, key: getRenderKey() })
}
