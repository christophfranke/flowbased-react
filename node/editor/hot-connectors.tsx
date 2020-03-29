import React from 'react'
import { computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { flatten, connectors } from '@editor/util'
import * as LA from '@editor/la'

import { Node, Connector, Mouse } from '@editor/types'


const BEZIER_DISTANCE = 100

@inject('mouse', 'nodes')
@observer
class HotConnectors extends React.Component {
  @computed get connectors(): Connector[] {
    return connectors(this.nodes)
  }
  @computed get pendingConnectors(): Connector[] {
    return this.connectors.filter(connector => connector.position && connector.state === 'pending')
  }

  mouse: Mouse = this.props['mouse']
  nodes: Node[] = this.props['nodes']

  getNode(connector: Connector): Node | undefined {
    return this.nodes.find(node => flatten(Object.values(node.connectors))
      .some(con => con === connector))
  }

  path(connector: Connector): string {
    const node = this.getNode(connector)
    const start = LA.add(node!.position, connector.position!)
    const end = this.mouse.position!

    const diff = LA.subtract(end, start)
    const factor = Math.max(Math.min(LA.distance(diff), BEZIER_DISTANCE), LA.product(diff, connector.direction))
    const middle = LA.madd(start, factor, connector.direction)

    return `M${start.x} ${start.y} Q${middle.x} ${middle.y} ${end.x} ${end.y}`
  }

  render () {
    if (!this.mouse.position) {
      return null
    }

    const style: React.CSSProperties = {
      position: 'absolute',
      pointerEvents: 'none',
      width: '100%',
      height: '100%',
      overflow: 'visible'
    }

    return <svg style={style}>
      <g stroke="black" strokeWidth="2" fill="none">
        {this.pendingConnectors.map(connector => <path key={connector.id} d={this.path(connector)} />)}
      </g>
    </svg>
  }
}

export default HotConnectors