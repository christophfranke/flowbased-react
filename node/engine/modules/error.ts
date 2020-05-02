import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value } from '@engine/render'
import { createEmptyValue, intersectAll } from '@engine/type-functions'
import { inputs } from '@engine/tree'

export const Dependencies = ['Core']

export const name = 'Error'
export type Nodes = 'ModuleNotFound' | 'NodeNotFound'
export const Node: Engine.ModuleNodes<Nodes> = {
  ModuleNotFound: {
    value: (node: Engine.Node) => null,
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => context.modules.Core.Type.Mismatch.create('Module not found')
      }
    }
  },
  NodeNotFound: {
    value: (node: Engine.Node) => null,
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => context.modules.Core.Type.Mismatch.create('Module not found')
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  ModuleNotFound: {
    name: 'Module not Found',
    type: 'Error',
    options: ['nocreation'],
    documentation: {
      explanation: 'The module of this node could not be resolved.',
    },
    create: () => ({
      type: 'ModuleNotFound',
      params: [],
    })
  },
  NodeNotFound: {
    name: 'Node not Found',
    type: 'Error',
    options: ['nocreation'],
    documentation: {
      explanation: 'The module of this node could not be resolved.',
    },
    create: () => ({
      type: 'NodeNotFound',
      params: [],
    })
  }}

export type Types = never
export const Type: Engine.ModuleTypes<Types> = {}
