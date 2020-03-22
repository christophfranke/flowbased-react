import { Node } from '@engine/types'

export interface EditorNode {
  node: Node
  type: 'Node' | 'Output'
  position: {
    x: number
    y: number
  }
  zIndex: number
  movable: boolean
  editable: boolean
}

export interface EditorNodeProps {
  node: EditorNode
}