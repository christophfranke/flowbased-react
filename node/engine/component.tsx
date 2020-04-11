import React from 'react'
import { observer } from 'mobx-react'
import { computed, observable } from 'mobx'
import { RenderProps, NodeProps, Node, Scope } from '@engine/types'
import { value, type } from '@engine/render'
import { contains } from '@engine/type-functions'
import { transformer } from '@shared/util'
import Nodes from '@engine/nodes'

let currentRenderId = 0
function getRenderKey(): number {
  currentRenderId += 1
  return currentRenderId
}


const HOC = (Component, scope: Scope) => {
  @observer
  class RenderComponent extends React.Component<NodeProps> {
    @transformer
    getChild(childNode: Node) {
      const result = value(childNode, scope)
      if (contains(type(childNode), 'Object') || contains(type(childNode), 'Pair')) {
        if (contains(type(childNode), 'Element')) {
          return '{ Complex Object }'
        }
        return JSON.stringify(result)
      }

      return result
    }

    @computed get children() {
      return this.props.node.connections.input.map(child => this.getChild(child.node))
    }

    @computed get properties() {
      return this.props.node.connections.properties.reduce((obj, property) => ({
        ...obj,
        [property.key]: value(property.node, scope)
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
