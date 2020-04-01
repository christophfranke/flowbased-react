import React from 'react'
import { Node } from '@engine/types'

import Nodes from '@engine/nodes'
import withChildren from '@engine/nodes/with-children'


export function value(node: Node): any {
  const fn = Nodes[node.type].value
  return fn(node)
}

const renderedIds = {}
export function render(node: Node): React.ReactElement {
  console.log('create', node.id)
  const Component = Nodes[node.type].render
  return React.createElement(withChildren(Component), { node })
}
