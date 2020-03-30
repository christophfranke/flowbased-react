import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'

import  { Connection, Node, Connector } from '@editor/types'

import * as LA from '@editor/la'

import store from '@editor/store'

const BEZIER_DISTANCE = 150

@observer
class Connections extends React.Component {
  path(connection: Connection): string {
    const fromNode = store.nodeOfConnector(connection.from)
    const toNode = store.nodeOfConnector(connection.to)

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
      overflow: 'visible',
      transform: 'translate(10px, 10px)' // TODO: do not compensate this here
    }

    return <svg style={style}>
      <g stroke="black" strokeWidth="2" fill="none">
        {store.connections.map(connection => <path key={connection.id} d={this.path(connection)} />)}
      </g>
    </svg>
  }
}

export default Connections