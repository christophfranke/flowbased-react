import * as Engine from '@engine/types'

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

export type ConnectorFunction = 'input' | 'output' | 'property' | 'action'
export type ConnectorState = 'default' | 'hot' | 'pending'
export type ConnectorMode = 'single' | 'multiple' | 'duplicate'
export interface Connector {
  id: number
  name: string
  display? : string
  mode: ConnectorMode
  function: ConnectorFunction
  direction: Vector
  position?: Vector
}

export type InputType = 'text' | 'number' | 'checkbox' | 'textarea' | 'textlist' | 'pairs' | 'hidden'
export interface Parameter {
  name: string
  key: string
  value: any
  type: InputType
}

export interface Node {
  id: number
  name: string
  type: string
  position: Vector
  boundingBox?: Rectangle
}

export interface Mouse {
  position?: Vector
}