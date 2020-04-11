import React from 'react'
import { Node, RenderProps, ValueType, Scope } from '@engine/types'
import { value, type, unmatchedType } from '@engine/render'
import { scopeResolvers } from '@engine/scopes'
import * as TypeDefinition from '@engine/type-definition'
import { flatten } from '@shared/util'

import Tag from '@engine/nodes/tag'
import Preview from '@engine/nodes/preview'
import component from '@engine/component'

export interface Resolver {  
  type: {
    input?: TypeResolver,
    output: TypeResolver,
    properties: {
      [key: string]: TypeResolver
    }
  },
  scopeFilter?: ScopeFilter
  resolveWithScope?: (node: Node, scope: Scope) => ScopedValueResolver
  resolve: ValueResolver
}
type ValueResolver = (node: Node, current: Scope) => any
type TypeResolver = (node: Node) => ValueType
type ScopeFilter = (childResolvers: ScopedValueResolver[]) => ScopedValueResolver[]
export type ScopedValueResolver = (valueFn: (child: Scope) => any, parent: Scope) => any



interface Nodes {
  [key: string]: Resolver
}

export type CoreNode = 'String'
  | 'Number'
  | 'Boolean'
  | 'Array'
  | 'Object'
  | 'Pair'
  | 'Tag'
  | 'Preview'
  | 'Iterate'
  | 'Collect'

const Nodes: Nodes = {
  String: {
    resolve: (node: Node) => node.params.value,
    type: {
      output: () => TypeDefinition.String,
      properties: {}
    }
  },
  Number: {
    resolve: (node: Node) => node.params.value,
    type: {
      output: () => TypeDefinition.Number,
      properties: {}
    }
  },
  Boolean: {
    resolve: (node: Node) => node.params.value,
    type: {
      output: () => TypeDefinition.Boolean,
      properties: {}
    }
  },
  Array: {
    resolve: (node: Node, current: Scope) => node.connections.input.map(connection => value(connection.node, current)),
    type: {
      output: (node: Node) =>
        TypeDefinition.Array(node.connections.input[0]
          ? unmatchedType(node.connections.input[0].node)
          : TypeDefinition.Unresolved),
      input: (node: Node) => type(node).params.items || TypeDefinition.Mismatch,
      properties: {}
    }
  },
  Iterate: {
    resolve: (node: Node, scope: Scope) => scope.locals.value,
    resolveWithScope: (node: Node, current: Scope) => (valueFn: (child: Scope) => any, parent: Scope) => {
      if (node.connections.input[0]) {
        const result = value(node.connections.input[0].node, current).map((value, index) => {
          return valueFn({
            parent,
            locals: {
              value,
              index
            }
          })
        })
        return result
      }

      return []
    },
    type: {
      output: (node: Node) => {
        if (node.connections.input[0]) {
          const type = unmatchedType(node.connections.input[0].node)
          if (type.name !== 'Array') {
            return TypeDefinition.Mismatch
          }

          return type.params.items
        }

        return TypeDefinition.Unresolved
      },
      input: (node: Node) => TypeDefinition.Array(type(node)),
      properties: {}
    }
  },
  Collect: {
    resolve: (node: Node, scope: Scope) => {
      if (node.connections.input[0]) {
        const resolvers = scopeResolvers(node.connections.input[0].node, scope)
        if (resolvers.length > 0) {
          return resolvers[0](child => value(node.connections.input[0].node, child), scope)
        }
      }

      return []
    },
    scopeFilter: (childResolvers: ScopedValueResolver[]) => childResolvers.filter((child, index) => index > 0),
    type: {
      output: (node: Node) =>
        TypeDefinition.Array(node.connections.input[0]
          ? unmatchedType(node.connections.input[0].node)
          : TypeDefinition.Unresolved),
      input: (node: Node) => type(node).params.items || TypeDefinition.Mismatch,
      properties: {}
    }
  },
  Object: {
    resolve: (node: Node, scope: Scope) => node.connections.input
      .map(connection => value(connection.node, scope))
      .filter(pair => pair.key)
      .reduce((obj, pair) => ({
        ...obj,
        [pair.key]: pair.value
      }), {}),
    type: {
      output: (node: Node) => TypeDefinition.Object(node.connections.input
        .map(connection => ({
          key: connection.node.params.key,
          type: unmatchedType(connection.node).params.value || TypeDefinition.Mismatch
        }))
        .filter(pair => pair.key)
        .reduce((obj, pair) => ({
          ...obj,
          [pair.key]: pair.type
        }), {})),
      input: () => TypeDefinition.Pair(TypeDefinition.Unresolved),
      properties: {}
    }
  },
  Pair: {
    resolve: (node: Node, scope: Scope) => ({
      key: node.params.key,
      value: node.connections.input[0] ? value(node.connections.input[0].node, scope) : undefined
    }),
    type: {
      output: (node: Node) => TypeDefinition.Pair(node.connections.input[0]
        ? unmatchedType(node.connections.input[0].node)
        : TypeDefinition.Unresolved),
      input: () => TypeDefinition.Unresolved,
      properties: {}
    }
  },
  Tag: {
    resolve: (node: Node, scope: Scope) => component(node, Tag, scope),
    type: {
      output: () => TypeDefinition.Element,
      input: () => TypeDefinition.Unresolved,
      properties: {
        classList: () => TypeDefinition.Array(TypeDefinition.String),
        style: () => TypeDefinition.Object({}),
        props: () => TypeDefinition.Object({})
      }
    }
  },
  Preview: {
    resolve: (node: Node, scope: Scope) => component(node, Preview, scope),
    type: {
      output: () => TypeDefinition.Element,
      input: () => TypeDefinition.Element,
      properties: {}
    }
  }
}

export default Nodes