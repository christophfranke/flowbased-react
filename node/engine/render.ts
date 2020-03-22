import React from 'react'
import { Node, Input, RenderOutput } from '@engine/types'

import Combine from './render-node/combine'
import Text from './render-node/text'
import Tag from './render-node/tag'

const RenderComponents = {
  Combine,
  Text,
  Tag
}

export function renderNode(node: Node): RenderOutput {
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
