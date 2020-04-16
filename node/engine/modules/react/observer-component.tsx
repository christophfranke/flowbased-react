import React from 'react'
import { observer } from 'mobx-react'
import { computed, observable } from 'mobx'
import { Node, Scope, Port, Connection } from '@engine/types'
import { RenderProps, NodeProps } from './types'

import { value, type } from '@engine/render'
import { inputs } from '@engine/tree'
import { contains } from '@engine/type-functions'
import { transformer } from '@shared/util'


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
      const nodeType = type(input.node, scope.context)
      if (contains(nodeType, 'Object') || contains(nodeType, 'Pair') || nodeType.name === 'Boolean') {
        if (contains(type(input.node, scope.context), 'Element')) {
          return '{ Complex Object }'
        }
        return JSON.stringify(result)
      }

      return result
    }

    @computed get children() {
      return inputs(this.props.node).map(child => this.getChild(child))
    }

    // @computed get properties() {
    //   return this.props.node.connections.properties.reduce((obj, property) => ({
    //     ...obj,
    //     [property.key]: value(property.node, scope)
    //   }), {})
    // }

    @computed get params() {
      return this.props.node.params
    }

    render() {
      return <Component params={this.params} properties={{}}>
        {this.children}
      </Component>
    }
  }

  return RenderComponent
}

export default function(node: Node, Component: React.ComponentType<RenderProps>, scope: Scope): any {
  return React.createElement(HOC(Component, scope), { node, key: getRenderKey() })
}
