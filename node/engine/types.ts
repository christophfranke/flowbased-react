import React from 'react'

type ValueResolver = (node: Node, current: Scope, key: string) => any
type TypeResolver = (node: Node, context: Context) => ValueType
type ContextResolver = (node: Node, context: Context) => Context

export interface NodeDefinition {
  type: {
    input?: {
      [key: string]: TypeResolver,
    },
    output?: {
      [key: string]: TypeResolver,
    },
  },
  context?: ContextResolver
  value: ValueResolver
}

export type ModuleNodes<NodeName extends keyof any> = {
  [key in NodeName]: NodeDefinition
}

export type ModuleTypes<TypeName extends keyof any> = {
  [key in TypeName]: ValueTypeDefinition<key>
}

export interface ValueTypeDefinition<name> {
  create: (...args) => ValueTypeTemplate<name>
  emptyValue: () => any
  test: (any) => boolean
}

export type ValueType = ValueTypeTemplate<any>
export interface ValueTypeTemplate<T> {
  readonly display: string
  readonly name: T
  readonly params: {
    [key: string]: ValueType
  }
}

export interface Connection {
  readonly id: number
  readonly src: Port
  readonly target: Port
}

export interface Port {
  node: Node
  key: string
}

export interface Params {  
  [key: string]: string
}

export interface Node {
  readonly id: number
  readonly type: string
  readonly params: Params
  connections: {
    readonly input: Connection[]
    readonly output: Connection[]
  }
}

export interface Context {
  definitions: {
    Node: ModuleNodes<string>
    Type: ModuleTypes<string>
  }
}

export interface Scope {
  locals: {
    [key: string]: any
  },
  context: Context
  parent: Scope | null
}
