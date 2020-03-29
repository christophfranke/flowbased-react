import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import  { Connection, Node, Connector } from '@editor/types'

import { flatten } from '@editor/util'
import * as LA from '@editor/la'

const BEZIER_DISTANCE = 150

@inject('connections', 'nodes')
@observer
class Connections extends React.Component {
  connections: Connection[] = this.props['connections']
  nodes: Node[] = this.props['nodes']

  getNode(connector: Connector): Node | undefined {
    return this.nodes.find(node => flatten(Object.values(node.connectors))
      .some(con => con === connector))
  }

  path(connection: Connection): string {
    const fromNode = this.getNode(connection.from)
    const toNode = this.getNode(connection.to)

    if (fromNode && toNode && connection.from.position && connection.to.position) {
      const fromCoords = LA.add(fromNode.position, connection.from.position)
      const toCoords = LA.add(toNode.position, connection.to.position)

      const diff = LA.subtract(toCoords, fromCoords)
      const minFactor = Math.min(LA.distance(diff), BEZIER_DISTANCE)
      const fromFactor = Math.max(minFactor, LA.product(diff, connection.from.direction))
      const toFactor = Math.max(minFactor, LA.product(diff, connection.to.direction))
  
      const middle1 = LA.madd(fromCoords, fromFactor, connection.from.direction)
      const middle2 = LA.madd(toCoords, toFactor, connection.to.direction)

      return `M${fromCoords.x} ${fromCoords.y} C${middle1.x} ${middle1.y} ${middle2.x} ${middle2.y} ${toCoords.x} ${toCoords.y}`
    }

    return ''
  }

  render() {
    const style: React.CSSProperties = {
      position: 'absolute',
      pointerEvents: 'none',
      width: '100%',
      height: '100%',
      overflow: 'visible'
    }

    return <svg style={style}>
      <g stroke="black" strokeWidth="2" fill="none">
        {this.connections.map(connection => <path key={connection.id} d={this.path(connection)} />)}
      </g>
    </svg>
  }
}

export default Connections