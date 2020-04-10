import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Connection, Node, Connector, Vector } from '@editor/types'
import Store from '@editor/store'
import { colors, colorOfType } from '@editor/colors'
import { type } from '@engine/render'

import * as LA from '@editor/la'

interface Props {
  connection: Connection
}

@inject('store')
@observer
class ConnectionPath extends React.Component<Props> {
  store: Store = this.props['store']

  @computed get fromNode(): Node | undefined {
    return this.store.nodeOfConnector(this.props.connection.from)
  }

  @computed get color(): string {
    if (this.fromNode) {    
      const node = this.store.translated.getNode(this.fromNode)
      return colorOfType(type(node)).default
    }

    return ''
  }

  @computed get offset(): Vector | null {
    if (this.fromNode && this.props.connection.from.position) {
       return LA.add(this.fromNode.position, this.props.connection.from.position)
    }

    return null
  }

  @computed get diff(): Vector | null {
    const toNode = this.store.nodeOfConnector(this.props.connection.to)
    if (toNode && this.props.connection.to.position) {
      const toCoords = LA.add(toNode.position, this.props.connection.to.position)
      if (this.offset) {
        return LA.subtract(toCoords, this.offset)
      }
    }

    return null
  }

  @computed get transform(): string {
    if (this.offset) {
      const o = LA.round(this.offset)
      return `translate(${o.x}px, ${o.y}px)`
    }

    return 'none'
  }

  @computed get d(): string {
    if (this.offset && this.diff) {    
      const distance = LA.distance(this.diff)
      const middle1 = LA.scale(distance / 2, this.props.connection.from.direction)
      const middle2 = LA.madd(this.diff, distance / 2, this.props.connection.to.direction)

      const o = LA.round(this.offset)
      const v2 = LA.round(middle1)
      const v3 = LA.round(middle2)
      const v4 = LA.round(this.diff)
      return `M0 0 C${v2.x} ${v2.y} ${v3.x} ${v3.y} ${v4.x} ${v4.y}`    
    }

    return ''
  }

  render() {
    return <path d={this.d} style={{ transform: this.transform, willChange: 'transform' }} stroke={this.color}/>
  }
}

@inject('store')
@observer
class Connections extends React.Component {
  store: Store = this.props['store']

  render() {
    const style: React.CSSProperties = {
      position: 'absolute',
      pointerEvents: 'none',
      width: '100%',
      height: '100%',
      overflow: 'visible'
    }

    return <svg style={style}>
      <g strokeWidth="2" fill="none">
        {this.store.connections.map(connection => <ConnectionPath key={connection.id} connection={connection} />)}
      </g>
    </svg>
  }
}

export default Connections