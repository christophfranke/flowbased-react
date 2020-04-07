import React from 'react'

export type ValueType = 'Element' | 'String' | 'Pair' | 'List' | 'Object' | 'Nothing'
export interface Connection {
  readonly id: number
  readonly node: Node
  readonly type: ValueType
  readonly key: string
}

export interface Params<T> {
  [key: string]: T
}
export interface Properties {
  [key: string]: any
}
export type NodeType = 'Preview' | 'Blank' | 'Tag' | 'String' | 'Object' | 'Pair' | 'List'
export interface Node {
  readonly id: number
  readonly type: NodeType
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
