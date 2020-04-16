import * as Engine from '@engine/types'

import { value, type, unmatchedType } from '@engine/render'
import { intersectAll } from '@engine/type-functions'

import * as Core from '@engine/modules/core'

export type Nodes = 'Array'
export const Node: Engine.ModuleNodes<Nodes> = {
  Array: {
    value: (node: Engine.Node, current: Engine.Scope) =>
      node.connections.input.map(connection => value(connection.src.node, current, connection.src.key)),
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => Type.Array.create(
          intersectAll(
            node.connections.input.map(con => unmatchedType(con.src.node, context, con.src.key)),
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

export type Types = 'Array'
export const Type: Engine.ModuleTypes<Types> = {
  Array: {
    create: (items: Engine.ValueType) => ({
      display: 'Array<{items}>',
      name: 'Array',
      params: {
        items
      }
    }),
    emptyValue: () => [],
    test: value => Array.isArray(value)
  },
}
