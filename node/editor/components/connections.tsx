import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Connection, Node, Connector, Vector } from '@editor/types'
import Store from '@editor/store'
import { colors, colorOfType } from '@editor/colors'
import { deliveredType, expectedType, numIterators } from '@engine/render'
import { transformer } from '@engine/util'

import * as LA from '@editor/la'

interface Props {
  connection: Connection
}

const LINE_STYLE = 'LINE_STYLE'
const BEZIER_STYLE = 'BEZIER_STYLE'
const CONNECTION_STYLE = BEZIER_STYLE

@inject('store')
@observer
class ConnectionPath extends React.Component<Props> {
  store: Store = this.props['store']

  @computed get srcConnector(): Connector | null {
    return this.store.connector.connector(this.props.connection.src)
  }

  @computed get srcNode(): Node {
    return this.srcConnector!.group.ports.node
  }

  @computed get srcPosition(): Vector | undefined {
    return this.srcConnector!.position
  }

  @computed get srcDirection(): Vector {
    return this.srcConnector!.group.direction
  }

  @computed get targetConnector(): Connector | null {
    return this.store.connector.connector(this.props.connection.target)
  }

  @computed get targetNode(): Node {
   return this.targetConnector!.group.ports.node 
  }

  @computed get targetPosition(): Vector | undefined {
    return this.targetConnector!.position
  }

  @computed get targetDirection(): Vector {
    return this.targetConnector!.group.direction
  }


  @computed get fromColor(): string {
    const node = this.store.translated.getNode(this.srcNode.id)
    return colorOfType(deliveredType(node, 'output', this.store.context)).default
  }

  @computed get toColor(): string {
    const node = this.store.translated.getNode(this.targetNode.id)
    return colorOfType(deliveredType(node, 'output', this.store.context)).default
  }

  @computed get numIterators(): number {
    return this.srcNode
      ? numIterators(this.store.translated.getNode(this.srcNode.id))
      : 0
  }

  @transformer
  colorOfNode(editorNode: Node): string {
    const node = this.store.translated.getNode(editorNode.id)
    return colorOfType(deliveredType(node, 'output', this.store.context)).default
  }

  @computed get offset(): Vector | null {
    if (this.srcNode && this.srcPosition) {
       return LA.add(this.srcNode.position, this.srcPosition)
    }

    return null
  }

  @computed get diff(): Vector | null {
    if (this.targetPosition) {
      const toCoords = LA.add(this.targetNode.position, this.targetPosition)
      if (this.offset) {
        return LA.subtract(toCoords, this.offset)
      }
    }

    return null
  }

  @computed get transform(): string {
    if (this.offset) {
      const o = this.offset
      return `translate(${o.x}px, ${o.y}px)`
    }

    return 'none'
  }

  currentD = ''
  currentDiff: Vector
  @computed get d(): string {
    if (this.currentDiff && this.diff) {
      // allow 2px error
      if (LA.distance(this.currentDiff, this.diff) < 2) {
        return this.currentD
      }
    }

    if (this.diff) {
      const distance = LA.distance(this.diff)
      const middle1 = LA.scale(distance / 2, this.srcDirection)
      const middle2 = LA.madd(this.diff, distance / 2, this.targetDirection)

      const v2 = middle1
      const v3 = middle2
      const v4 = this.diff

      // try cache the result to not rerender the curve
      this.currentDiff = this.diff
      this.currentD = {
        [BEZIER_STYLE]: `M0 0 C${v2.x} ${v2.y} ${v3.x} ${v3.y} ${v4.x} ${v4.y}`,
        [LINE_STYLE]: `M0 0 L${v4.x} ${v4.y}`
      }[CONNECTION_STYLE]

      return this.currentD
    }

    return ''
  }

  render() {
    if (!this.srcConnector || !this.targetConnector || !this.diff) {
      return null
    }

    const diff = this.diff
    const width = 3 + 8 * this.numIterators
    const fromColor = this.fromColor
    const toColor = this.toColor

    if (fromColor !== toColor) {    
      const id = `gradient-${this.props.connection.id}`
      const stroke = `url(#${id})`
      const rotation = Math.sign(diff.y) * 180 * Math.acos(LA.normalize(diff).x) / Math.PI
      const gradientProps = {
        id,
        x1: '0%',
        x2: '100%',
        y1: '0%',
        y2: '0%',
        gradientTransform: `translate(0.5, 0.5) rotate(${rotation}) translate(-0.5, -0.5)`
      }

      return <>
        <defs>
          <linearGradient {...gradientProps}>
              <stop stopColor={fromColor} offset="0%"/>
              <stop stopColor={toColor} offset="100%"/>
          </linearGradient>
        </defs>    
        <path strokeWidth={width} d={this.d} style={{ transform: this.transform, willChange: 'transform', stroke }} />
      </>
    }

    return <path strokeWidth={width} d={this.d} style={{ transform: this.transform, willChange: 'transform', stroke: fromColor }} />
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
      <g fill="none">
        {this.store.connections.map(connection => <ConnectionPath key={connection.id} connection={connection} />)}
      </g>
    </svg>
  }
}

export default Connections