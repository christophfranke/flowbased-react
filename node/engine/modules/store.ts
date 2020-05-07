import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { observable, autorun, runInAction } from 'mobx'

import { value, deliveredType, inputValueAt, inputValuesAt, inputTypeAt, inputTypesAt } from '@engine/render'
import { inputs, match } from '@engine/tree'
import { intersectAll, createEmptyValue, testValue } from '@engine/type-functions'

export const Dependencies = ['Core', 'Event']

export const name = 'Store'
export type Nodes = 'Variable'
export const Node: Engine.ModuleNodes<Nodes> = {
  Variable: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      if (!scope.locals[node.id]) {
        scope.locals[node.id] = observable({
          value: inputValueAt(node, 'initialValue', scope),
          unsubscribe: []
        })

        autorun(() => {
          const triggers = inputValuesAt(node, 'set', scope)
          const initialValue = inputValueAt(node, 'initialValue', scope)
          
          runInAction(() => {
            scope.locals[node.id].value = initialValue
            scope.locals[node.id].unsubscribe.forEach(fn => fn())
            scope.locals[node.id].unsubscribe = triggers
              .map(trigger => trigger.subscribe(argument => {
                scope.locals[node.id].value = argument
              }))
          })
        })
      }

      return scope.locals[node.id].value
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          const setType = intersectAll(inputTypesAt(node, 'set', context), context)
          const initialType = inputTypeAt(node, 'initialValue', context)

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
