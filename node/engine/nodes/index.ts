import React from 'react'
import { Node, RenderProps, ValueType, Scope } from '@engine/types'
import { value, type, unmatchedType } from '@engine/render'
import { childEntries } from '@engine/scopes'
import * as TypeDefinition from '@engine/type-definition'
import { createEmptyValue, intersectAll } from '@engine/type-functions'
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
type TypeResolver = (node: Node, other?: Node) => ValueType
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
  | 'Textlist'
  | 'TextPairs'
  | 'GetKey'

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
      output: (node: Node) => TypeDefinition.Array(
        intersectAll(node.connections.input.map(con => unmatchedType(con.node)))),
      input: (node: Node) => {
        const nodeType = type(node)
        if (nodeType.name === 'Unresolved') {
          return TypeDefinition.Unresolved
        }

        return type(node).params.items
          || TypeDefinition.Mismatch(`Expected Array, got ${nodeType.name}`)
      },
      properties: {}
    }
  },
  Iterate: {
    resolve: (node: Node, scope: Scope) => scope.locals[node.id]
      ? scope.locals[node.id].value
      : createEmptyValue(type(node)), // <- although this should never happen in practice
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
            return TypeDefinition.Mismatch(`Expected Array, got ${type.name}`)
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
      const input = node.connections.input[0]
      if (!input) {
        return []
      }

      const scopeEntries = childEntries(node, entry => entry.type === 'Iterator').reverse()
      const mergeScopes = (scope1: Scope, scope2: Scope): Scope => ({
        locals: {
          ...scope1.locals,
          ...scope2.locals
        },
        parent: current
      })

      const scopes: Scope[] = scopeEntries.reduce((scopes, entry) => flatten(scopes.map(scope => entry.scopes(scope).map(newScope => mergeScopes(scope, newScope)))), [current])
      return scopes.map(scope => value(input.node, scope))
    },
    exit: (entry: ScopeDescriptor) => entry.type === 'Iterator',
    type: {
      output: (node: Node) =>
        TypeDefinition.Array(node.connections.input[0]
          ? unmatchedType(node.connections.input[0].node)
          : TypeDefinition.Unresolved),
      input: (node: Node) => type(node).params.items
        || TypeDefinition.Mismatch(`Expected Array, got ${type(node).name}`),
      properties: {}
    }
  },
  Object: {
    resolve: (node: Node, scope: Scope) => node.connections.input
      .map(connection => value(connection.node, scope))
      .filter(pair => pair.key)
      .reduce((obj, pair) => ({
        ...obj,
        [pair.key.trim()]: pair.value
      }), {}),
    type: {
      output: (node: Node) => TypeDefinition.Object(node.connections.input
        .map(connection => ({
          key: connection.node.params.key.trim(),
          type: unmatchedType(connection.node).params.value
            || TypeDefinition.Mismatch(`Expected Pair, got ${unmatchedType(connection.node).name}`)
        }))
        .filter(pair => pair.key)
        .reduce((obj, pair) => ({
          ...obj,
          [pair.key.trim()]: pair.type
        }), {})),
      input: (node, other) => other && other.params.key
        ? TypeDefinition.Pair(type(node).params[other!.params.key.trim()])
        : TypeDefinition.Pair(TypeDefinition.Unresolved),
      properties: {}
    }
  },
  GetKey: {
    resolve: (node: Node, scope: Scope) => {
      return node.connections.input[0]
        ? value(node.connections.input[0].node, scope)[node.params.key.trim()]
        : createEmptyValue(type(node))
    },
    type: {
      output: (node: Node) => {
        if (node.connections.input[0] && node.params.key) {
          const inputType = unmatchedType(node.connections.input[0].node)
          if (inputType.name !== 'Unresolved') {
            return inputType.params[node.params.key.trim()]
              || TypeDefinition.Mismatch(`Expected Object with key ${node.params.key.trim()}`)
          }
        }

        return TypeDefinition.Unresolved
      },
      input: (node: Node) => node.params.key
        ? TypeDefinition.Object({ [node.params.key.trim()]: type(node) })
        : TypeDefinition.Object({}),
      properties: {}
    }
  },
  If: {
    resolve: (node: Node, scope: Scope) => {
      const conditionInput = node.connections.properties.find(prop => prop.key === 'condition')
      const ifTrueInput = node.connections.input[0]
      const ifFalseInput = node.connections.input[1]
      
      return conditionInput && value(conditionInput.node, scope)
        ? (ifTrueInput 
          ? value(ifTrueInput.node, scope)
          : createEmptyValue(type(node)))
        : (ifFalseInput
          ? value(ifFalseInput.node, scope)
          : createEmptyValue(type(node)))
    },
    type: {
      output: (node: Node) => intersectAll(node.connections.input.map(con => unmatchedType(con.node))),
      input: (node: Node) => type(node),
      properties: {
        condition: () => TypeDefinition.Boolean
      }
    }
  },
  Pair: {
    resolve: (node: Node, scope: Scope) => ({
      key: node.params.key.trim(),
      value: node.connections.input[0]
        ? value(node.connections.input[0].node, scope)
        : createEmptyValue(type(node).params.value)
    }),
    type: {
      output: (node: Node) => TypeDefinition.Pair(node.connections.input[0]
        ? unmatchedType(node.connections.input[0].node)
        : TypeDefinition.Unresolved),
      input: (node) => type(node).params.value,
      properties: {}
    }
  },
  Textlist: {
    resolve: (node: Node) => {
      return node.params.value
    },
    type: {
      output: () => TypeDefinition.Array(TypeDefinition.String),
      properties: {}
    }
  },
  TextPairs: {
    resolve: (node: Node) => {
      return { ...(node.params.value as {}) }
    },
    type: {
      output: (node: Node) => TypeDefinition.Object(Object.keys(node.params.value)
        .filter(key => key)
        .reduce((obj, key) => ({
          ...obj,
          [key.trim()]: TypeDefinition.String
        }), {})),
      properties: {}
    }  },
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