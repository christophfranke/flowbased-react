import React from 'react'
import { observer } from 'mobx-react'
import { computed, observable } from 'mobx'
import { RenderProps, NodeProps, Node } from '@engine/types'
import { render, value } from '@engine/render'
import { transformer } from '@shared/util'

export default (Component) => {
  @observer
  class RenderComponent extends React.Component<NodeProps> {
    @transformer
    getChild(childNode: Node) {
      return render(childNode, [...this.props.parents, this.props.node])
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