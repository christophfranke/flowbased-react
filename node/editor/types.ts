import { Node } from '@engine/types'

export interface EditorNode {
  node: Node
  position: {
    x: number
    y: number
  }
  zIndex: number
  movable: boolean
  editable: boolean
}