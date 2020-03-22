import React from 'react'

export type RenderOutput = React.ReactElement | React.ReactElement[] | string | string[] | null | undefined
export type NodeType = 'Tag' | 'Text' | 'Combine'

export interface RenderProps {
  inputs: Input[]
  params: Object
}

export interface Input {
  node: Node
}

export interface Node {
  type: NodeType
  inputs: Input[]
  params: any
}

export interface TextNode extends Node {
  type: 'Text'
  params: {
    text: string
  }
}

export interface TagNode extends Node {
  type: 'Tag'
  params: {
    tag: string,
    props: Object
  }
}
export interface CombineNode extends Node {
  type: 'Combine',
  params: {}
}