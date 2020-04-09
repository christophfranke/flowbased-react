import React from 'react'
import { observer } from 'mobx-react'
import { computed, observable } from 'mobx'
import { RenderProps, NodeProps, Node } from '@engine/types'
import { value, type } from '@engine/render'
import { contains } from '@engine/type-functions'
import { transformer } from '@shared/util'
import Nodes from '@engine/nodes'

let currentRenderId = 0
function getRenderKey(): number {
  currentRenderId += 1
  return currentRenderId
}


const HOC = (Component) => {
  @observer
  class RenderComponent extends React.Component<NodeProps> {
    @transformer
    getChild(childNode: Node) {
      const result = value(childNode)
      if (contains(type(childNode), 'Object')) {
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
        [property.key]: value(property.node)
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

export default function(node: Node, Component: React.ComponentType<RenderProps>): any {
  const parents = []
  return React.createElement(HOC(Component), { node, parents, key: getRenderKey() })
}
