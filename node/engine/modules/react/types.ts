import { Params, Node } from '@engine/types'

export interface RenderProps {
  children?: React.ReactChildren
  properties: {
    [key: string]: any
  }
  params: Params
}

export interface NodeProps {
  key: number
  node: Node
}
