import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, type, unmatchedType } from '@engine/render'
import { inputs, outputs, firstInput, match } from '@engine/tree'
import { intersectAll, createEmptyValue } from '@engine/type-functions'

export const Dependencies = ['Core']

export type Nodes = 'Array' | 'Items' | 'Collect'
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
            return nodeType
          }

          return type(node, context).params.items
            || context.modules.Core.Type.Mismatch.create(`Expected Array, got ${nodeType.name}`)
        }
      }
    }
  },
  Items: {
    value: (node: Engine.Node, scope: Engine.Scope) => scope.locals.item
      ? scope.locals.item
      : createEmptyValue(type(node, scope.context)),
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          if (inputs(node).length > 0) {
            const input = inputs(node)[0]
            const type = unmatchedType(input.node, context, input.key)
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
        input: (node: Engine.Node, context: Engine.Context) => Type.Array.create(type(node, context)),
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
            ? unmatchedType(firstInput(node)!.node, context, firstInput(node)!.key)
            : context.modules.Core.Type.Unresolved.create())
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          const outputType = type(node, context)
          if (outputType.name === 'Unresolved') {
            return outputType
          }

          if (outputType.name === 'Array') {
            return outputType.params.items  
          }

          return context.modules.Core.Type.Mismatch.create(`Expected Array, got ${type(node, context).name}`)
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
    test: value => Array.isArray(value)
  },
}
