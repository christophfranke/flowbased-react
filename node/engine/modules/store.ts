import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { observable } from 'mobx'

import { value, deliveredType } from '@engine/render'
import { inputs, firstInput, match } from '@engine/tree'
import { intersectAll, createEmptyValue, testValue } from '@engine/type-functions'

export const Dependencies = ['Core', 'Event']

export const name = 'Store'
export type Nodes = 'Variable'
export const Node: Engine.ModuleNodes<Nodes> = {
  Variable: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      // TODO: make a reasonable teardown/update
      if (!scope.locals[node.id]) {
        const initialValueConnection = node.connections.input.initialValue && node.connections.input.initialValue[0]
        const initialValue = initialValueConnection
          ? value(initialValueConnection.src.node, scope, initialValueConnection.src.key)
          : createEmptyValue(deliveredType(node, 'output', scope.context), scope.context)

        scope.locals[node.id] = observable({
          value: initialValue
        })

        const inputs = node.connections.input.set
        if (inputs) {
          const triggers = inputs.map(input => value(input.src.node, scope, input.src.key))
          triggers.forEach(trigger => trigger.subscribe(argument => {
            scope.locals[node.id].value = argument
          }))
        }
      }

      return scope.locals[node.id].value
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          const setConnection = node.connections.input.set && node.connections.input.set[0]
          const initialConnection = node.connections.input.initialValue && node.connections.input.initialValue[0]
          const setType = setConnection
            ? deliveredType(setConnection.src.node, setConnection.src.key, context)
            : context.modules.Core.Type.Unresolved.create()
          const initialType = initialConnection
            ? deliveredType(initialConnection.src.node, initialConnection.src.key, context)
            : context.modules.Core.Type.Unresolved.create()

          return intersectAll(
            [initialType, setType.name === 'Unresolved'
              ? setType
              : setType.name === 'Trigger'
                ? setType.params.argument
                : context.modules.Core.Type.Mismatch.create(`Set input expected trigger type, got ${setType.name}`)],
          context)
        }
      },
      input: {
        initialValue: (node: Engine.Node, context: Engine.Context) => {
          return deliveredType(node, 'output', context)
        },
        set: (node: Engine.Node, context: Engine.Context) => {
          return context.modules.Event.Type.Trigger.create(deliveredType(node, 'output', context))
        }
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Variable: {
    name: 'Variable',
    type: 'Variable',
    documentation: {
      explanation: 'A permanent store for a value, that can be changed based on triggers.',
      input: {
        initialValue: 'The inital value of the variable.',
        set: 'Whenever triggered, the new value will be stored.'
      },
      output: {
        output: 'The current value of the variable.'
      }
    },
    ports: {
      input: {
        set: ['side', 'duplicate', 'allow-loops']
      }
    },
    create: () => ({
      type: 'Variable',
      params: [],
    })    
  }
}

export type Types = never
export const Type: Engine.ModuleTypes<Types> = {}
