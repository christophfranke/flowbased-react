import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, deliveredType, inputValueAt, expectedType, inputTypeAt } from '@engine/render'
import { inputs, firstInput, match, inputAt } from '@engine/tree'
import { intersectAll, createEmptyValue, testValue } from '@engine/type-functions'

export const Dependencies = ['Core']

export const name = 'Event'
export type Nodes = 'Listen' | 'TriggerValue'
export const Node: Engine.ModuleNodes<Nodes> = {
  Listen: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      // TODO: make a reasonable teardown/update 
      const input = firstInput(node)
      if (input) {
        const emitter = value(input.node, scope, input.key)
        emitter.subscribe(node.params.event, (e) => {
          scope.locals[node.id].subscribers.forEach(fn => fn(node.params.event))
        })
      }

      if (!scope.locals[node.id]) {
        scope.locals[node.id] = {
          subscribers: []
        }
      }

      return {
        subscribe: (fn) => {
          scope.locals[node.id].subscribers.push(fn)
        }
      }
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
    // TODO: make a reasonable teardown/update
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
