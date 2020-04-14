import * as Engine from '@engine/types'

import { value, type, unmatchedType } from '@engine/render'
import { intersectAll } from '@engine/type-functions'

import * as Core from '@engine/modules/core'

export type Nodes = 'Array'
export const Node: Engine.ModuleNodes<Nodes> = {
  Array: {
    value: (node: Engine.Node, current: Engine.Scope) =>
      node.connections.input.map(connection => value(connection.node, current)),
    type: {
      output: {
        output: (node: Engine.Node) => Type.Array.create(
          intersectAll(node.connections.input.map(con => unmatchedType(con.node))))
      },
      input: {
        input: (node: Engine.Node) => {
          const nodeType = type(node)
          if (nodeType.name === 'Unresolved') {
            return Core.Type.Unresolved.create()
          }

          return type(node).params.items
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
