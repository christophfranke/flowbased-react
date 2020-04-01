import React from 'react'
import { observer } from 'mobx-react'
import { computed } from 'mobx'
import { RenderProps, NodeProps } from '@engine/types'
import { render, value } from '@engine/render'

export default (Component) => {
  @observer
  class WithChildren extends React.Component<NodeProps> {
    @computed get children() {
      return this.props.node.connections.input.map(child => render(child.node))
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
      console.log('render ....', this.props.node.id)

      return <Component params={this.params} properties={this.properties}>
        {this.children}
      </Component>
    }
  }

  return WithChildren
}