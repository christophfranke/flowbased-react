import { EditorNode } from '@editor/types'
import { Node } from '@engine/types'

export default (node: Node, options = {}): EditorNode => {
  return {
    node,
    type: 'Node',
    position: {
      x: 0,
      y: 0
    },
    zIndex: 0,
    movable: true,
    editable: true,
    ...options
  }
}