import { Params, Node } from '@engine/types'
import { IObservableObject } from 'mobx'

export type Func<A, B> = (...A) => B

export interface RenderProps {
  children?: React.ReactChildren
  properties: {
    [key: string]: any
  }
  listeners: {
    [key: string]: Func<any, void>[]
  }
  params: Params
}

export interface NodeProps {
  node: Node
}

export interface TagLocals {
  component: any
  listeners: {
    [key: string]: Func<any, void>[]
  }
}