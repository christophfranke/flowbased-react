import React from 'react'
import { Input, Renderable } from '@engine/types'

export default (inputs: Input[]): Renderable[] => inputs.map(({ node, name }) => node.output(name)())