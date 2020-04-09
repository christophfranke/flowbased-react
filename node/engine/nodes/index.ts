import React from 'react'
import { Node, RenderProps, ValueType } from '@engine/types'
import { value, type, unmatchedType } from '@engine/render'
import * as TypeDefinition from '@engine/type-definition'

import RenderTag from '@engine/nodes/tag/render'
import RenderPreview from '@engine/nodes/preview/render'

export interface Resolver {  
  type: {
    input?: TypeResolver,
    output: TypeResolver,
    properties: {
      [key: string]: TypeResolver
    }
  },
}

export interface ValueResolver extends Resolver {
  resolve: (node: Node) => any
  renderFunction: 'Value'
}

type ReactComponent = React.Component<RenderProps>
type ReactFunction = (props: RenderProps) => React.ReactElement
type TypeResolver = (node: Node) => ValueType

interface ReactComponentResolver extends Resolver {
  resolve: ReactComponent | ReactFunction
  renderFunction: 'React.Component'
}


interface Nodes {
  [key: string]: ValueResolver | ReactComponentResolver
}

export type CoreNode = 'String' | 'Number' | 'Boolean' | 'Array' | 'Object' | 'Pair' | 'Tag' | 'Preview'
const Nodes: Nodes = {
  String: {
    resolve: (node: Node) => node.params.value,
    type: {
      output: () => TypeDefinition.String,
      properties: {}
    },
    renderFunction: 'Value'
  },
  Number: {
    resolve: (node: Node) => node.params.value,
    type: {
      output: () => TypeDefinition.Number,
      properties: {}
    },
    renderFunction: 'Value'
  },
  Boolean: {
    resolve: (node: Node) => node.params.value,
    type: {
      output: () => TypeDefinition.Boolean,
      properties: {}
    },
    renderFunction: 'Value'
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
    },
    renderFunction: 'Value'
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
          type: unmatchedType(connection.node).params.value
        }))
        .filter(pair => pair.key)
        .reduce((obj, pair) => ({
          ...obj,
          [pair.key]: pair.type
        }), {})),
      input: () => TypeDefinition.Pair(TypeDefinition.Unresolved),
      properties: {}
    },
    renderFunction: 'Value'
  },
  Pair: {
    resolve: (node: Node) => ({
      key: node.params.key,
      value: node.connections.input[0] ? value(node.connections.input[0].node) : undefined
    }),
    type: {
      output: (node: Node) => TypeDefinition.Pair(node.connections.input[0] ? unmatchedType(node.connections.input[0].node) : TypeDefinition.Unresolved),
      input: () => TypeDefinition.Unresolved,
      properties: {}
    },
    renderFunction: 'Value'
  },
  Tag: {
    resolve: RenderTag,
    type: {
      output: () => TypeDefinition.Element,
      input: () => TypeDefinition.Unresolved,
      properties: {
        props: () => TypeDefinition.Object({}),
        style: () => TypeDefinition.Object({}),
        classList: () => TypeDefinition.Array(TypeDefinition.String)
      }
    },
    renderFunction: 'React.Component'
  },
  Preview: {
    resolve: RenderPreview,
    type: {
      output: () => TypeDefinition.Null,
      input: () => TypeDefinition.Element,
      properties: {}
    },
    renderFunction: 'React.Component'
  }
}

export default Nodes