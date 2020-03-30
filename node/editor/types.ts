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

export type ConnectorFunction = 'input' | 'output' | 'property' | 'action'
export type ValueType = 'Element' | 'Text' | 'Boolean' | 'Number' | 'List' | 'Object' | 'Nothing'
export type ConnectorState = 'default' | 'hot' | 'pending'
export type ConnectorMode = 'multiple' | 'reconnect'
export interface Connector {
  id: number
  name: string
  mode: ConnectorMode
  function: ConnectorFunction
  type: ValueType
  direction: Vector
  position?: Vector
}

export interface Parameter<T> {
  name: string
  key: string
  value: T
}

export interface Node {
  id: number
  name: string
  params: Parameter<string>[]
  position: Vector
  connectors: {
    input: Connector[]
    output: Connector[]
    properties: Connector[]
  }
}

export interface Mouse {
  position?: Vector
}