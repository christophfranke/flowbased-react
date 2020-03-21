import React from 'react'

export type Renderable = React.ReactElement | string
export type Value = () => Renderable

export interface Input {
  node: Source
  name?: string
}

export interface Source {
  output: (name?: string) => Value
}

export interface Node extends Source {
  inputs: Input[]
}
