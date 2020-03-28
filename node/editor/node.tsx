import React from 'react'
import { observer, inject } from 'mobx-react'

import { Node, Vector } from '@editor/types'

import ConnectorView from '@editor/connector'
import * as LA from '@editor/la'

interface Props {
  node: Node
}

const CONNECTOR_SIZE = 15
const DESCRIPTION_HEIGHT = 20
const DESCRIPTION_WIDTH = 100
const NODE_PADDING = 5

@inject('mouse')
@observer
class NodeView extends React.Component<Props> {
  offset: Vector

  handleMouseDown = e => {
    e.preventDefault()
    e.stopPropagation()

    const mouse = this.props['mouse'].position
    if (mouse) {    
      this.offset = LA.subtract(mouse, this.props.node.position)

      window.addEventListener('mousemove', this.handleMouseMove)
      window.addEventListener('mouseup', this.handleMouseUp)
    }
  }

  handleMouseMove = e => {
    const mouse = this.props['mouse'].position
    if (mouse) {
      this.props.node.position = LA.subtract(mouse, this.offset)
    }
  }

  handleMouseUp = () => {
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)
  }

  render() {
    const { node } = this.props

    const height = 2 * CONNECTOR_SIZE + DESCRIPTION_HEIGHT + 2 * NODE_PADDING
    const width = Math.max(
      (node.connectors.input.length + node.connectors.output.length) * CONNECTOR_SIZE,
      DESCRIPTION_WIDTH) + 2 * NODE_PADDING

    const nodeStyle: React.CSSProperties = {
      padding: '5px',
      position: 'absolute',
      cursor: 'move',
      willChange: 'transform',
      transform: `translate(${this.props.node.position.x}px, ${this.props.node.position.y}px)`,
      backgroundColor: 'white',
      outline: '1px solid pink',
    }

    return <div style={nodeStyle} onMouseDown={this.handleMouseDown}>
        <div style={{ position: 'relative' }}>
          {node.connectors.input.map(input => <ConnectorView key={input.id} connector={input} />)}
          <div style={{ pointerEvents: 'none' }}>{node.name}</div>
          {node.connectors.output.map(output => <ConnectorView key={output.id} connector={output} />)}
        </div>
      </div>
  }
}

export default NodeView