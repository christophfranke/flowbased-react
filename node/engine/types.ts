import React from 'react'

type ValueResolver = (node: Node, current: Scope, key: string) => any
type TypeResolver = (node: Node, context: Context) => ValueType
type ContextResolver = (node: Node, context: Context) => Context

export interface Module {
  name: string
  Type: ModuleTypes<string>
  Node: ModuleNodes<string> 
}

export interface NodeDefinition {
  type: {
    input?: {
      [key: string]: TypeResolver
    },
    output: {
      output: TypeResolver
      [key: string]: TypeResolver
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
  emptyValue: (type: ValueType, context: Context) => any
  test: (value: any, type: ValueType, context: Context) => boolean
  combine?: {  
    union?: (src: ValueType, target: ValueType, context: Context) => ValueType
    intersect?: (src: ValueType, target: ValueType, context: Context) => ValueType
    matchInto?: (src: ValueType, target: ValueType, context: Context) => ValueType
  }
}

export type ValueType = ValueTypeTemplate<any>
export interface ValueTypeTemplate<T> {
  readonly display: string
  readonly name: T
  readonly module: string
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
  [key: string]: any
}

export interface NodeIdentifier {  
  readonly type: string
  readonly module: string
}

export interface Node extends NodeIdentifier {
  readonly id: number
  readonly params: Params
  connections: {
    readonly input: {
      [key: string]: Connection[]
    }
    readonly output: {
      [key: string]: Connection[]
    }
  }
}

export interface Context {
  modules: {
    [key: string]: Module
  }
  types: {
    [id: number]: {
      [key: string]: ValueType
    }
    [key: string]: any
  }
  defines: Node[]
}

export interface Scope {
  locals: {
    [key: string]: any
  },
  context: Context
  parent: Scope | null
}
