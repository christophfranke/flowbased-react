import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { autorun, observable, runInAction } from 'mobx'

import { value, deliveredType, inputValueAt, expectedType, inputTypeAt } from '@engine/render'
import { inputs, firstInput, match, inputAt } from '@engine/tree'
import { intersectAll, createEmptyValue, testValue } from '@engine/type-functions'

export const Dependencies = ['Core']

export const name = 'Event'
export type Nodes = 'Listener' | 'TriggerValue'
export const Node: Engine.ModuleNodes<Nodes> = {
  Listener: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      // TODO: make a reasonable teardown/update 
      if (!scope.locals[node.id]) {
        scope.locals[node.id] = observable({
          listeners: [],
          unsubscribe: null,
          output: createEmptyValue(deliveredType(node, 'output', scope.context), scope.context)
        })

        autorun(() => {
          const input = firstInput(node)
          if (input) {
            // gather data
            const emitter = value(input.node, scope, input.key)
            const eventName = node.params.event

            // update output
            runInAction(() => {
              if (scope.locals[node.id].unsubscribe) {
                scope.locals[node.id].unsubscribe()
              }

              scope.locals[node.id].unsubscribe = emitter.subscribe(
                eventName,
                (e) => {
                  scope.locals[node.id].listeners.forEach(fn => fn(eventName))          
                }
              )

              scope.locals[node.id].output = {
                subscribe: (fn) => {
                  scope.locals[node.id].listeners.push(fn)
                  return () => {
                    scope.locals[node.id].listeners = scope.locals[node.id].listeners
                      .filter(sub => sub !== fn)
                  }
                }
              }
            }) // action end
          }
        }) // autorun end
      }

      return scope.locals[node.id].output
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) =>
          Type.Trigger.create(context.modules.Core.Type.Null.create())
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          return Type.Event.create()
        }
      }
    }
  },
  TriggerValue: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const triggerValue = inputValueAt(node, 'trigger', scope)

      return {
        subscribe: (fn) => triggerValue.subscribe(
          () => fn(inputValueAt(node, 'value', scope))
        )
      }
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) =>
          Type.Trigger.create(inputTypeAt(node, 'value', context))
      },
      input: {
        trigger: (node: Engine.Node, context: Engine.Context) => {
          return Type.Trigger.create(context.modules.Core.Type.Unresolved.create())
        },
        value: (node: Engine.Node, context: Engine.Context) => {
          const nodeType = deliveredType(node, 'output', context)
          return nodeType.params.argument || context.modules.Core.Type.Unresolved.create()
        }
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Listener: {
    name: 'Listener',
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
      type: 'Listener',
      params: [{
        name: 'Event',
        key: 'event',
        value: 'click',
        type: 'text'
      }],
    })    
  },
  TriggerValue: {
    name: 'Trigger Value',
    type: 'TriggerValue',
    documentation: {
      explanation: 'Takes a trigger and sets its value. Whenever the trigger is triggered, the value input will be evaluated and transmitted with the trigger.',
      input: {
        value: 'The value that will be transmitted.',
        trigger: 'A trigger that pushes this trigger. Its value will be discarded.'
      },
      output: {
        output: 'The new transformed trigger with the new value.'
      }
    },
    ports: {
      input: {
        value: ['allow-loops'],
        trigger: ['side']
      },
      output: {
        output: ['side']
      }
    },
    create: () => ({
      type: 'TriggerValue',
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
    emptyValue: () => ({
      subscribe: () => () => null
    }),
    test: (value, type: Engine.ValueType, context: Engine.Context) =>
      value && value.subscribe && typeof value.subscribe === 'function'
  },
  Event: {
    create: () => ({
      display: 'Event',
      name: 'Event',
      module: 'Event',
      params: {}
    }),
    emptyValue: () => ({
      subscribe: () => () => null
    }),
    test: (value, type: Engine.ValueType, context: Engine.Context) =>
      value && value.subscribe && typeof value.subscribe === 'function'
  },}
