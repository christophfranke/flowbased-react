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

export type ConnectorState = 'default' | 'hot' | 'pending'
export type ConnectorMode = 'multiple' | 'reconnect'
export interface Connector {
  id: number
  name: string
  connections: number
  mode: ConnectorMode
  direction: Vector
  position?: Vector
}

export interface Node {
  id: number
  name: string
  position: Vector
  connectors: {
    input: Connector[]
    output: Connector[]
  }
}

export interface Mouse {
  position?: Vector
}