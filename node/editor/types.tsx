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
  from: Connector
  to: Connector
}

export interface Connector {
  id: number
  name: string
  position: Vector
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