import React from 'react'
import { observer } from 'mobx-react'
import { RenderProps, NodeProps } from '@engine/types'
import { render, value } from '@engine/render'

export default (Component) => {
  @observer
  class WithChildren extends React.Component<NodeProps> {
    render() {
      console.log('render', this.props.node.id)

      const children = this.props.node.connections.input.map(child => render(child.node))
      const properties = this.props.node.connections.properties.reduce((obj, property) => ({
        ...obj,
        [property.key]: value(property.node)
      }), {})
      const props: RenderProps = {
        key: this.props.node.id,
        params: this.props.node.params,
        properties,
      }

      return <Component {...props}>{children}</Component>
    }
  }

  return WithChildren
}