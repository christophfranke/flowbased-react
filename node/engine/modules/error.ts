import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, type, unmatchedType } from '@engine/render'
import { createEmptyValue, intersectAll } from '@engine/type-functions'
import { inputs } from '@engine/tree'

export const Dependencies = ['Core']

export const name = 'Error'
export type Nodes = 'ModuleNotFound'
export const Node: Engine.ModuleNodes<Nodes> = {
  ModuleNotFound: {
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
    documentation: {
      explanation: 'The module of this node could not be resolved.',
    },
    create: () => ({
      type: 'ModuleNotFound',
      params: [],
    })
  }
}

export type Types = never
export const Type: Engine.ModuleTypes<Types> = {}
