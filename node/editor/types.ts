import { Node } from '@engine/types'

export interface Vector2d {
  x: number
  y: number
}

export interface EditorNode {
  node: Node
  type: 'Node' | 'Output'
  name: string
  position: Vector2d
  zIndex: number
  movable: boolean
  editable: boolean
}

export interface EditorNodeProps {
  node: EditorNode
}

export interface PendingConnection {
  type: 'Outgoing' | 'Incoming'
  node: Node
  position: Vector2d
}

export interface EditorGlobals {
  sheetDimensions: Vector2d
  highZ: number
  pendingConnections: PendingConnection[]  
}