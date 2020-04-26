import React from 'react'
import { observer } from 'mobx-react'
import { computed, observable } from 'mobx'
import { Node, Scope, Port, Connection } from '@engine/types'
import { RenderProps, NodeProps } from './types'

import { value, deliveredType } from '@engine/render'
import { inputs } from '@engine/tree'
import { contains } from '@engine/type-functions'
import { transformer } from '@engine/util'


let currentRenderId = 0
function getRenderKey(): number {
  currentRenderId += 1
  return currentRenderId
}


const HOC = (Component, scope: Scope) => {
  @observer
  class RenderComponent extends React.Component<NodeProps> {
    @transformer
    getChild(input: Port) {
      const result = value(input.node, scope, input.key)
      const nodeType = deliveredType(input.node, 'output', scope.context)
      if (contains(nodeType, 'Object') || contains(nodeType, 'Pair') || nodeType.name === 'Boolean') {
        if (contains(deliveredType(input.node, 'output', scope.context), 'Element')) {
          return '{ Complex Object }'
        }
        return JSON.stringify(result)
      }

      return result
    }

    @computed get children() {
      return this.props.node.connections.input.input
        ? this.props.node.connections.input.input
          .map(input => this.getChild(input.src))
        : []
    }

    @computed get properties() {
      return Object.keys(this.props.node.connections.input)
        .filter(key => key !== 'input')
        .reduce((obj, key) => ({
          ...obj,
          [key]: this.props.node.connections.input[key].length > 0
            ? value(
              this.props.node.connections.input[key][0].src.node,
              scope,
              this.props.node.connections.input[key][0].src.key)
            : null
        }), {})
    }

    @computed get params() {
      return this.props.node.params
    }

    render() {
      return <Component params={this.params} properties={this.properties}>
        {this.children}
      </Component>
    }
  }

  return RenderComponent
}

export default function(node: Node, Component: React.ComponentType<RenderProps>, scope: Scope): any {
  return React.createElement(HOC(Component, scope), { node, key: getRenderKey() })
}
