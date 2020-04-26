import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, deliveredType } from '@engine/render'
import { inputs, outputs, firstInput, match } from '@engine/tree'
import { intersectAll, createEmptyValue, testValue } from '@engine/type-functions'

export const Dependencies = ['Core']

export const name = 'Array'
export type Nodes = 'Array' | 'Items' | 'Collect'
export const Node: Engine.ModuleNodes<Nodes> = {
  Array: {
    value: (node: Engine.Node, current: Engine.Scope) =>
      inputs(node).map(src => value(src.node, current, src.key)),
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => Type.Array.create(
          intersectAll(
            inputs(node).map(src => deliveredType(src.node, src.key, context)),
            context
          )
        )
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          const nodeType = deliveredType(node, 'output', context)
          if (nodeType.name === 'Unresolved') {
            return nodeType
          }

          return nodeType.params.items
            || context.modules.Core.Type.Mismatch.create(`Expected Array, got ${nodeType.name}`)
        }
      }
    }
  },
  Items: {
    value: (node: Engine.Node, scope: Engine.Scope) => scope.locals.item
      ? scope.locals.item
      : createEmptyValue(deliveredType(node, 'output', scope.context), scope.context),
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          if (inputs(node).length > 0) {
            const input = inputs(node)[0]
            const type = deliveredType(input.node, input.key, context)
            if (type.name === 'Unresolved') {
              return context.modules.Core.Type.Unresolved.create()
            }
            if (type.name !== 'Array') {
              return context.modules.Core.Type.Mismatch.create(`Expected Array, got ${type.name}`)
            }

            return type.params.items
          }

          return context.modules.Core.Type.Unresolved.create()
        }
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => Type.Array.create(deliveredType(node, 'output', context)),
      }
    }
  },
  Collect: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const itemsNode = match(node,
        candidate => candidate.type === 'Items',
        candidate => candidate.type === 'Collect')

      if (itemsNode) {
        const itemsInput = firstInput(itemsNode)
        const array = itemsInput
          ? value(itemsInput.node, scope, itemsInput.key)
          : []

        const scopes = array.map(item => ({
          ...scope,
          parent: scope,
          locals: {
            ...scope.locals,
            item
          }
        }))

        return scopes.map(childScope => value(firstInput(node)!.node, childScope, firstInput(node)!.key))
      }

      return []
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) =>
          Type.Array.create(firstInput(node)
            ? deliveredType(firstInput(node)!.node, firstInput(node)!.key, context)
            : context.modules.Core.Type.Unresolved.create())
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          const outputType = deliveredType(node, 'output', context)
          if (outputType.name === 'Unresolved') {
            return outputType
          }

          if (outputType.name === 'Array') {
            return outputType.params.items  
          }

          return context.modules.Core.Type.Mismatch.create(`Expected Array, got ${deliveredType(node, 'output', context).name}`)
        }
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Array: {
    name: 'Array',
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
      type: 'Array',
      params: [],
    })    
  },
  Items: {
    name: 'Items',
    type: 'Iterator',
    documentation: {
      explanation: 'Extracts the items out of an *Array* by creating a new *Scope* for each item.',
      input: {
        input: 'Any *Array*'
      },
      output: {
        output: 'The item of the current iteration scope.'
      }
    },
    create: () => ({
      type: 'Items',
      params: [],
    })
  },
  Collect: {
    name: 'Collect',
    type: 'Iterator',
    documentation: {
      explanation: 'Collects the extracted items of the *Items* Iterator and resolves its *Scope*.',
      input: {
        input: 'Anything that uses the *Items Scope*.'
      },
      output: {
        output: 'Outputs an *Array* with the transformed values.'
      }
    },
    create: () => ({
      type: 'Collect',
      params: []
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
    test: (value, type: Engine.ValueType, context: Engine.Context) =>
      Array.isArray(value) && value.every(value => testValue(value, type.params.items, context))
  },
}
