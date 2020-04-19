import * as Engine from '@engine/types'

import * as Core from '@engine/modules/core'

export interface Module extends Engine.Module {
  EditorNode: ModuleNodes<string>
}
export type ModuleNodes<NodeName extends keyof any> = {
  [key in NodeName]: NodeDefinition<key>
}

export type NodeOption = 'singleton'
export interface NodeDefinition<T = string> {
  type: string
  name: string
  options?: NodeOption[]
  documentation: {
    explanation: string
    input?: {
      [key: string]: string
    }
    output?: {
      [key: string]: string
    }
    params?: {
      [key: string]: string
    }
  }
  ports?: {
    [key in ConnectorFunction]?: {
      [key: string]: ConnectorOption[]
    }
  }
  create: () => RawNode<T>
}

export type ConnectorOption = 'side' | 'duplicate' | 'hidden'

export type ValueType = Engine.ValueType
export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface Vector {
  x: number
  y: number
}

export interface ConnectorDescription<Function extends ConnectorFunction = ConnectorFunction> {
  nodeId: number
  key: string
  slot: number
  function: Function
}

export interface Connection {
  id: number
  src: ConnectorDescription<'output'>
  target: ConnectorDescription<'input'>
}

export interface Ports {
  node: Node
  input: {
    main: ConnectorGroup<'input', 'single' | 'duplicate'>[]
    side: ConnectorGroup<'input', 'single' | 'duplicate'>[]
  }
  output: {
    main: ConnectorGroup<'output', 'multiple' | 'hidden'>[]
    side: ConnectorGroup<'output', 'multiple'>[]
  }
}

export interface ConnectorGroup<Function extends ConnectorFunction = ConnectorFunction, Mode extends ConnectorMode = ConnectorMode> {
  ports: Ports
  connectors: Connector[]
  mode: Mode
  function: ConnectorFunction
  direction: Vector
  key: string
  name: string
}

export type ConnectorFunction = 'input' | 'output'
export type ConnectorState = 'default' | 'hot' | 'pending'
export type ConnectorMode = 'single' | 'multiple' | 'duplicate' | 'hidden'
export interface Connector<Function extends ConnectorFunction = ConnectorFunction> {
  group: ConnectorGroup<Function>
  position?: Vector
}

export type InputType = 'text' | 'number' | 'checkbox' | 'textarea' | 'textlist' | 'pairs' | 'hidden'
export interface Parameter {
  name: string
  key: string
  value: any
  type: InputType
}

export interface RawNode<T> {
  type: T
  params: Parameter[]  
}

export interface Node extends RawNode<string> {
  id: number
  module: string
  position: Vector
  zIndex: number
  boundingBox?: Rectangle
}

export interface Mouse {
  position?: Vector
}