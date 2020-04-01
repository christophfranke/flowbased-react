import React from 'react'

export type ValueType = 'Element' | 'Text' | 'Pair' | 'List' | 'Object' | 'Nothing'
export interface Connection {
  readonly id: number
  readonly node: Node
  readonly type: ValueType
}

export interface Params<T> {
  [key: string]: T
}
export interface Properties {
  [key: string]: any
}
export type RenderNode = 'Blank' | 'Tag' | 'Text' | 'Omit' | 'Pair'
export interface Node {
  readonly id: number
  readonly renderer: RenderNode
  readonly params: Params<string>
  connections: {
    readonly input: Connection[]
    readonly output: Connection[]
    readonly properties: Connection[]
  }
}

export interface RenderProps {
  children?: React.ReactChildren
  key: number
  params: Params<string>
  properties: Properties
}
