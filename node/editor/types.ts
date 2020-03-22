import { Node } from '@engine/types'

export interface EditorNode {
  node: Node
  name: string
  position: {
    x: number
    y: number
  }
}