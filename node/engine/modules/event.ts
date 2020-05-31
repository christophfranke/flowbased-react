import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { autorun, observable, runInAction } from 'mobx'

import { value, deliveredType, inputValueAt, expectedType, inputTypeAt } from '@engine/render'
import { inputs, firstInput, match, inputAt } from '@engine/tree'
import { intersectAll, createEmptyValue, testValue } from '@engine/type-functions'

export const Dependencies = ['Core']

export const name = 'Event'
export type Nodes = 'Listener' | 'TriggerValue' | 'ChangeArgument' | 'UseArgument' | 'CombineTrigger'
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
                  scope.locals[node.id].listeners.forEach(fn => fn(e))          
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
          Type.Trigger.create(Type.EventData.create())
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          return Type.EventEmitter.create()
        }
      }
    }
  },
  TriggerValue: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const triggerValue = inputValueAt(node, 'trigger', scope)

      return {
        subscribe: (fn) => triggerValue.subscribe(
          // getting the input value here will trigger a warning
          // as we actually do want to recompute here out of a reactive context
          // we can safely ignore this warning.
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
  },
  CombineTrigger: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const inputs = inputValueAt(node, 'input', scope)

      return {
        subscribe: (fn) => {
          const unsubscribes = inputs.map(input => input.subscribe(fn))
          return () => unsubscribes.forEach(fn => fn())
        }
      }
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          const inputType = inputTypeAt(node, 'input', context)

          if (inputType.name === 'Unresolved') {
            return Type.Trigger.create(inputType)
          }

          if (inputType.name === 'Array') {
            return inputType.params.items
          }

          return Type.Trigger.create(context.modules.Core.Type.Mismatch.create(`Invalid input type, expected Array, got ${inputType.name}`))
        }
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Array.Type.Array.create(deliveredType(node, 'output', context))
      }
    }
  },
  ChangeArgument: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      return scope.locals.ChangeArgument
        ? scope.locals.ChangeArgument
        : createEmptyValue(deliveredType(node, 'output', scope.context), scope.context)
    },
    type: {
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          return Type.Trigger.create(deliveredType(node, 'output', context))
        }
      },
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          const inputType = inputTypeAt(node, 'input', context)
          if (inputType.name === 'Unresolved') {
            return inputType
          }

          if (inputType.name !== 'Trigger') {
            return context.modules.Core.Type.Mismatch.create(`Expected type Trigger, got ${inputType.name}`)
          }

          return inputType.params.argument
        }
      }
    }
  },
  UseArgument: {    
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const changeArgumentNode = match(node,
        candidate => candidate.type === 'ChangeArgument',
        candidate => candidate.type === 'UseArgument')

      if (changeArgumentNode) {
        const triggerValue = inputValueAt(changeArgumentNode, 'input', scope)

        return {
          subscribe: (fn) => triggerValue.subscribe(
            (e) => {
              const newScope = {
                ...scope,
                locals: {
                  ...scope.locals,
                  ChangeArgument: e
                }
              }

              return fn(inputValueAt(node, 'input', newScope))
            }
          )
        }
      }

      return createEmptyValue(deliveredType(node, 'output', scope.context), scope.context)
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          return Type.Trigger.create(inputTypeAt(node, 'input', context))
        }
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          const outputType = deliveredType(node, 'output', context)
          if (outputType.name === 'Unresolved') {
            return outputType
          }

          if (outputType.name !== 'Trigger') {
            return context.modules.Core.Type.Mismatch.create(`Expected type Trigger, got ${outputType.name}`)
          }

          return outputType.params.argument
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
  },
  CombineTrigger: {
    name: 'Combine Trigger',
    type: 'CombineTrigger',
    ports: {
      input: {
        input: ['side']
      },
      output: {
        output: ['side']
      }
    },
    documentation: {
      explanation: ''
    },
    create: () => ({
      type: 'CombineTrigger',
      params: []
    })
  },
  ChangeArgument: {
    name: 'Change Argument',
    type: 'ChangeArgument',
    documentation: {
      explanation: ''
    },
    ports: {
      input: {
        input: ['side']
      }
    },
    create: () => ({
      type: 'ChangeArgument',
      params: []
    })
  },
  UseArgument: {
    name: 'Use Argument',
    type: 'UseArgument',
    documentation: {
      explanation: ''
    },
    ports: {
      output: {
        output: ['side']
      },
      input: {
        input: ['allow-loops']
      }
    },
    create: () => ({
      type: 'UseArgument',
      params: []
    })
  }
}

export type Types = 'Trigger' | 'EventData' | 'EventEmitter'
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
  EventEmitter: {
    create: () => ({
      display: 'EventEmitter',
      name: 'EventEmitter',
      module: 'Event',
      params: {}
    }),
    emptyValue: () => ({
      subscribe: () => () => null
    }),
    test: (value, type: Engine.ValueType, context: Engine.Context) =>
      value && value.subscribe && typeof value.subscribe === 'function'
  },
  EventData: {
    create: () => ({
      display: 'EventData',
      name: 'EventData',
      module: 'Event',
      params: {}
    }),
    emptyValue: () => ({}),
    test: (value, type: Engine.ValueType, context: Engine.Context) => {
      console.warn('Testing for EventData type is not implemented yet and will always return true')
      return true
    }
  }
}
