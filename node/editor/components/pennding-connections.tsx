import React from 'react'
import { computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import * as LA from '@editor/la'

import { Node, Connector, Mouse } from '@editor/types'
import { colors } from '@editor/colors'


const BEZIER_DISTANCE = 100

@inject('mouse', 'store')
@observer
class PendingConnections extends React.Component {
  mouse: Mouse = this.props['mouse']
  store = this.props['store']

  path(connector: Connector): string {
    const node = connector.group.ports.node
    if (connector.position) {    
      const start = LA.add(node!.position, connector.position)
      const end = this.mouse.position!

      const diff = LA.subtract(end, start)
      const factor = Math.max(Math.min(LA.distance(diff), BEZIER_DISTANCE), LA.product(diff, connector.group.direction))
      const middle = LA.madd(start, factor, connector.group.direction)

      return `M${start.x} ${start.y} Q${middle.x} ${middle.y} ${end.x} ${end.y}`
    }

    return ''
  }

  render () {
    if (!this.mouse.position || !this.store.pendingConnector) {
      return null
    }

    const style: React.CSSProperties = {
      position: 'absolute',
      pointerEvents: 'none',
      width: '100%',
      height: '100%',
      overflow: 'visible'    }

    return <svg style={style}>
      <g stroke={colors.connections} strokeWidth="2" fill="none">
        <path d={this.path(this.store.pendingConnector)} />
      </g>
    </svg>
  }
}

export default PendingConnections