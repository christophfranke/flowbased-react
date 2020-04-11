import React from 'react'
import { Node, RenderProps, ValueType, Scope } from '@engine/types'
import { value, type, unmatchedType } from '@engine/render'
import { childEntries } from '@engine/scopes'
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
  entry?: ScopeEntry
  exit?: ScopeExit
  resolve: ValueResolver
}
type ValueResolver = (node: Node, current: Scope) => any
type TypeResolver = (node: Node) => ValueType
type ScopeEntry = (node: Node) => ScopeDescriptor
export interface ScopeDescriptor {
  scopes: (current: Scope) => Scope[]
  owner: Node
  type: string
}
type ScopeExit = (descriptor: ScopeDescriptor) => boolean


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
  | 'If'

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
    resolve: (node: Node, scope: Scope) => scope.locals[node.id] && scope.locals[node.id].value,
    entry: (node: Node): ScopeDescriptor => ({
      scopes: (current: Scope): Scope[] => {
        if (node.connections.input[0]) {
          const result = value(node.connections.input[0].node, current).map((value, index) => {
            return {
              locals: {
                [node.id]: {              
                  value,
                  index
                }
              }
            }
          })
          return result
        }

        return []
      },
      owner: node,
      type: 'Iterator'
    }),
    type: {
      output: (node: Node) => {
        if (node.connections.input[0]) {
          const type = unmatchedType(node.connections.input[0].node)
          if (type.name === 'Unresolved') {
            return TypeDefinition.Unresolved
          }
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
    resolve: (node: Node, current: Scope) => {
      const cartesian = <T>(sets: T[][]):T[][] =>
        sets.reduce((acc, set) =>
          flatten(acc.map(x => set.map(y => [ ...x, y ]))),
          [[]])

      const scopeEntries = childEntries(node, entry => entry.type === 'Iterator').reverse()
      if (scopeEntries.length === 0) {
        return []
      }

      const mergeScopes = (scope1: Scope, scope2: Scope): Scope => ({
        locals: {
          ...scope1.locals,
          ...scope2.locals
        },
        parent: current
      })

      const scopes: Scope[] = scopeEntries.reduce((scopes, entry) => flatten(scopes.map(scope => entry.scopes(scope).map(newScope => mergeScopes(scope, newScope)))), [current])
      return scopes.map(scope => value(node.connections.input[0].node, scope))
    },
    exit: (entry: ScopeDescriptor) => entry.type === 'Iterator',
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
  If: {
    resolve: (node: Node, scope: Scope) => {
      const switchInput = node.connections.properties.find(prop => prop.key === 'switch')
      const condition = switchInput && value(switchInput.node, scope)
      const ifTrue = node.connections.input[0] && value(node.connections.input[0].node, scope)
      const ifFalse = node.connections.input[1] && value(node.connections.input[1].node, scope)

      return condition
        ? ifTrue
        : ifFalse
    },
    type: {
      output: (node: Node) => node.connections.input[0]
        ? unmatchedType(node.connections.input[0].node)
        : TypeDefinition.Unresolved,
      input: (node: Node) => type(node),
      properties: {
        switch: () => TypeDefinition.Boolean
      }
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