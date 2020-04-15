import * as Engine from '@engine/types'

import * as Core from '@engine/modules/core'

export interface Module extends Engine.Module {
  EditorNode: ModuleNodes<string>
}
export type ModuleNodes<NodeName extends keyof any> = {
  [key in NodeName]: NodeDefinition<key>
}

export interface NodeDefinition<T = string> {
  type: string
  create: () => RawNode<T>
}

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

export interface Connection {
  id: number
  from: Connector
  to: Connector
}

export interface Ports {
  node: Node
  input: {
    main: ConnectorGroup<'input', 'single' | 'duplicate'>[]
    side: ConnectorGroup<'input', 'single'>[]
  }
  output: {
    main: ConnectorGroup<'output', 'multiple'>[]
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
export type ConnectorMode = 'single' | 'multiple' | 'duplicate'
export interface Connector {
  group: ConnectorGroup
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
  name: string
  type: T
  params: Parameter[]  
}

export interface Node extends RawNode<Core.Nodes> {
  id: number
  position: Vector
  boundingBox?: Rectangle
}

export interface Mouse {
  position?: Vector
}