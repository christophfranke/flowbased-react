import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, type, unmatchedType } from '@engine/render'
import { inputs, outputs, firstInput, match } from '@engine/tree'
import { intersectAll, createEmptyValue, testValue } from '@engine/type-functions'

export const Dependencies = ['Core']

export const name = 'Trigger'
export type Nodes = 'Watch'
export const Node: Engine.ModuleNodes<Nodes> = {
  Watch: {
    value: (node: Engine.Node, current: Engine.Scope) =>
      null,
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => Type.Trigger.create(
          firstInput(node)
            ? unmatchedType(firstInput(node)!.node, context, firstInput(node)!.key)
            : context.modules.Core.Type.Unresolved.create()
        )
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          const nodeType = type(node, context)
          if (nodeType.name === 'Unresolved') {
            return nodeType
          }

          return type(node, context).params.argument
            || context.modules.Core.Type.Mismatch.create(`Expected Trigger, got ${nodeType.name}`)
        }
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Watch: {
    name: 'Watch',
    type: 'Trigger',
    documentation: {
      explanation: 'Watches a value for changes',
      input: {
        input: 'the value to watch'
      },
      output: {
        output: 'the trigger carrying the new value'
      }
    },
    ports: {
      output: {
        output: ['side']
      }
    },
    create: () => ({
      type: 'Watch',
      params: [],
    })    
  }
}

export type Types = 'Trigger'
export const Type: Engine.ModuleTypes<Types> = {
  Trigger: {
    create: (argument: Engine.ValueType) => ({
      display: 'Trigger<{argument}>',
      name: 'Trigger',
      module: 'Trigger',
      params: {
        argument
      }
    }),
    emptyValue: () => [],
    test: (value, type: Engine.ValueType, context: Engine.Context) =>
      Array.isArray(value) && value.every(value => testValue(value, type.params.items, context))
  },
}
