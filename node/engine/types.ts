import React from 'react'
import * as Nodes from '@engine/nodes'

export type ValueBaseType = 'Element' | 'String' | 'Boolean' | 'Array' | 'Object' | 'Number' | 'Pair' | 'Unresolved' | 'Null' | 'Mismatch' | 'Unknown'
export interface ValueType {
  display: string
  name: ValueBaseType,
  params: {
    [key: string]: ValueType
  }
}
export interface Connection {
  readonly id: number
  readonly node: Node
  readonly key: string
}

export interface Params<T> {
  [key: string]: T
}
export interface Properties {
  [key: string]: any
}

export type CoreNode = Nodes.CoreNode
export interface Node {
  readonly id: number
  readonly name: CoreNode
  readonly params: Params<string>
  connections: {
    readonly input: Connection[]
    readonly output: Connection[]
    readonly properties: Connection[]
  }
}

export interface RenderProps {
  children?: React.ReactChildren
  properties: Properties
  params: Params<string>
}

export interface NodeProps {
  key: number
  parents: Node[]
  node: Node
}
