import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, type, unmatchedType } from '@engine/render'
import { inputs, outputs } from '@engine/tree'
import { intersectAll } from '@engine/type-functions'

import * as Core from '@engine/modules/core'

export type Nodes = 'Array'
export const Node: Engine.ModuleNodes<Nodes> = {
  Array: {
    value: (node: Engine.Node, current: Engine.Scope) =>
      inputs(node).map(src => value(src.node, current, src.key)),
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => Type.Array.create(
          intersectAll(
            inputs(node).map(src => unmatchedType(src.node, context, src.key)),
            context
          )
        )
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          const nodeType = type(node, context)
          if (nodeType.name === 'Unresolved') {
            return Core.Type.Unresolved.create()
          }

          return type(node, context).params.items
            || Core.Type.Mismatch.create(`Expected Array, got ${nodeType.name}`)
        }
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Array: {
    type: 'Value',
    documentation: {
      explanation: 'Creates an *Array* value. An *Array* is a collection of items, that all share the same type.',
      input: {
        input: 'The items, that you want to collect'
      },
      output: {
        output: 'The *Array*'
      }
    },
    ports: {
      input: {
        input: ['duplicate']
      }
    },
    create: () => ({
      name: 'Array',
      type: 'Array',
      params: [],
    })    
  }
}

export type Types = 'Array'
export const Type: Engine.ModuleTypes<Types> = {
  Array: {
    create: (items: Engine.ValueType) => ({
      display: 'Array<{items}>',
      name: 'Array',
      module: 'Array',
      params: {
        items
      }
    }),
    emptyValue: () => [],
    test: value => Array.isArray(value)
  },
}
