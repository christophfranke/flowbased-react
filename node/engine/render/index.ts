import React from 'react'
import { Node, Input, RenderOutput } from '@engine/types'

import Combine from './combine'
import H1 from './h1'
import Text from './text'

const RenderComponents = {
  Combine,
  H1,
  Text
}

export function renderNode(node: Node): RenderOutput {
  console.log('rendering node', node.type)
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
