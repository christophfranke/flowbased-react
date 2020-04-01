import React from 'react'
import { Node, RenderProps } from '@engine/types'

import Nodes from '@engine/nodes'

type ClassComponent = React.Component<RenderProps>
type FunctionalComponent = (props: RenderProps) => React.ReactElement
interface RenderNodes {
  [key: string]: FunctionalComponent
}

interface Module {
  render(node: Node): React.ReactElement
  value(node: Node): any  
}

export function value(node: Node): any {
  const fn = Nodes[node.type].value
  return fn(node)
}

const renderedIds = {}
export function render(node: Node): React.ReactElement {
  const Component = Nodes[node.type].render

  const children = node.connections.input.map(child => render(child.node))
  const properties = node.connections.properties.reduce((obj, property) => ({
    ...obj,
    [property.key]: value(property.node)
  }), {})
  const props: RenderProps = {
    key: node.id,
    params: node.params,
    properties
  }

  return React.createElement(Component, props, children)
}
