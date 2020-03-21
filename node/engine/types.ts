import React from 'react'

export type RenderOutput = React.ReactElement | React.ReactElement[] | string | string[] | null | undefined

export interface RenderProps {
  inputs: Input[]
  params: Object
}

export interface Input {
  node: Node
}

export interface Node {
  type: string
  inputs: Input[]
  params: Object
}
