import React from 'react'
import { Node, RenderProps } from '@engine/types'

import Blank from '@engine/nodes/blank'
import Text from '@engine/nodes/text'
import Tag from '@engine/nodes/tag'
import Pair from '@engine/nodes/pair'

type ClassComponent = React.Component<RenderProps>
type FunctionalComponent = (props: RenderProps) => React.ReactElement
interface RenderNodes {
  [key: string]: FunctionalComponent
}

const RenderNodes: RenderNodes = {
  Pair,
  Blank,
  Text,
  Tag,
  Preview: Blank
}

function value(node: Node): any {
  return 
}

const renderedIds = {}
function render(node: Node): React.ReactElement {
  const Component = RenderNodes[node.type]

  const children = node.connections.input.map(child => render(child.node))
  const props: RenderProps = {
    key: node.id,
    params: node.params,
    properties: {}
  }

  return React.createElement(Component, props, children)
}


export default render