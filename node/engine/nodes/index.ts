import React from 'react'
import { Node, RenderProps, ValueType } from '@engine/types'
import { value, type, unmatchedType } from '@engine/render'
import * as TypeDefinition from '@engine/type-definition'

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
  resolve: (node: Node) => any
}
type TypeResolver = (node: Node) => ValueType



interface Nodes {
  [key: string]: Resolver
}

export type CoreNode = 'String' | 'Number' | 'Boolean' | 'Array' | 'Object' | 'Pair' | 'Tag' | 'Preview'
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
    resolve: (node: Node) => node.connections.input.map(connection => value(connection.node)),
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
    resolve: (node: Node) => node.connections.input
      .map(connection => value(connection.node))
      .filter(pair => pair.key)
      .reduce((obj, pair) => ({
        ...obj,
        [pair.key]: pair.value
      }), {}),
    type: {
      output: (node: Node) => TypeDefinition.Object(node.connections.input
        .map(connection => ({
          key: value(connection.node).key,
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
    resolve: (node: Node) => ({
      key: node.params.key,
      value: node.connections.input[0] ? value(node.connections.input[0].node) : undefined
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
    resolve: (node: Node) => component(node, Tag),
    type: {
      output: () => TypeDefinition.Element,
      input: () => TypeDefinition.Unresolved,
      properties: {
        props: () => TypeDefinition.Object({}),
        style: () => TypeDefinition.Object({}),
        classList: () => TypeDefinition.Array(TypeDefinition.String)
      }
    }
  },
  Preview: {
    resolve: (node: Node) => component(node, Preview),
    type: {
      output: () => TypeDefinition.Null,
      input: () => TypeDefinition.Element,
      properties: {}
    }
  }
}

export default Nodes