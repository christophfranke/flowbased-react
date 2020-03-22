import React from 'react'
import { Node, Input, RenderOutput } from '@engine/types'

import Output from './render-node/output'
import Text from './render-node/text'
import Tag from './render-node/tag'

const RenderComponents = {
  Output,
  Text,
  Tag
}


let renderedNodes: number[] = []
export function renderNode(node: Node): RenderOutput {
  if (node.type === 'Output') {
    renderedNodes = []
  }

  if (renderedNodes.includes(node.id)) {
    console.warn(`There is a loop in the render graph. Ignored ${node.type} ${node.id} to escape.`)
    return null
  }

  renderedNodes.push(node.id)

  const Component = RenderComponents[node.type]
  const props = {
    params: node.params,
    inputs: node.inputs
  }

  return React.createElement(Component, props)
}

export function renderInputs(inputs: Input[]): RenderOutput[] {
  return inputs.map(input => renderNode(input.node))
}
