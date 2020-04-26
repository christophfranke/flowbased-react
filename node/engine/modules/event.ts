import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, deliveredType } from '@engine/render'
import { inputs, outputs, firstInput, match } from '@engine/tree'
import { intersectAll, createEmptyValue, testValue } from '@engine/type-functions'

export const Dependencies = ['Core']

export const name = 'Event'
export type Nodes = 'Listen'
export const Node: Engine.ModuleNodes<Nodes> = {
  Listen: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const input = firstInput(node)
      if (input) {
        const emitter = value(input.node, scope, input.key)
        emitter.subscribe('click', () => {
          console.log('got click')
        })
      }

      return createEmptyValue(deliveredType(node, 'output', scope.context), scope.context)
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) =>
          Type.Trigger.create(context.modules.Core.Type.Unresolved.create())
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          return Type.Event.create()
          // const nodeType = type(node, context)
          // if (nodeType.name === 'Unresolved') {
          //   return nodeType
          // }

          // if (nodeType.name === 'Event') {
          //   return nodeType.params.argument
          // }

          // return context.modules.Core.Type.Mismatch.create(`Expected Event, got ${nodeType.name}`)
        }
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Listen: {
    name: 'Listen',
    type: 'Trigger',
    documentation: {
      explanation: 'Listens for events',
      input: {
        input: 'An event emitter to listen to'
      },
      output: {
        output: 'A trigger to trigger side effects'
      }
    },
    ports: {
      input: {
        input: ['side']
      },
      output: {
        output: ['side']
      }
    },
    create: () => ({
      type: 'Listen',
      params: [],
    })    
  }
}

export type Types = 'Trigger' | 'Event'
export const Type: Engine.ModuleTypes<Types> = {
  Trigger: {
    create: (argument: Engine.ValueType) => ({
      display: 'Trigger<{argument}>',
      name: 'Trigger',
      module: 'Event',
      params: {
        argument
      }
    }),
    emptyValue: () => [],
    test: (value, type: Engine.ValueType, context: Engine.Context) =>
      Array.isArray(value) && value.every(value => testValue(value, type.params.items, context))
  },
  Event: {
    create: () => ({
      display: 'Event',
      name: 'Event',
      module: 'Event',
      params: {}
    }),
    emptyValue: () => [],
    test: (value, type: Engine.ValueType, context: Engine.Context) =>
      Array.isArray(value) && value.every(value => testValue(value, type.params.items, context))
  },}
