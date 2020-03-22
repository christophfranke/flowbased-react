import { Node } from '@engine/types'

export interface Vector {
  x: number
  y: number
}

export interface EditorNode {
  node: Node
  type: 'Node' | 'Output'
  name: string
  position: Vector
  zIndex: number
  movable: boolean
  editable: boolean
}

export interface EditorNodeProps {
  node: EditorNode
}

export interface EditorConnection {
  src: EditorNode
  target: EditorNode
}

export interface PendingConnection {
  type: 'Outgoing' | 'Incoming'
  editorNode: EditorNode
  position: Vector
}

export interface EditorGlobals {
  sheetDimensions: Vector
  mousePosition: Vector
  highZ: number
  pendingConnections: PendingConnection[]
  establishedConnections: EditorConnection[]
}