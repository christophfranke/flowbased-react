import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Connector, ConnectorState, Connection, Vector, Node } from '@editor/types'

import { isServer } from '@editor/util'
import { rotate90, rotate270, scale } from '@editor/la'
import { colors, colorOfValueType } from '@editor/colors'
import store from '@editor/store'

import DownArrow from '@editor/components/down-arrow'
import RightArrow from '@editor/components/right-arrow'

interface Props {
  connector: Connector
}

const CONNECTOR_SIZE = 40

@inject('store')
@observer
class ConnectorView extends React.Component<Props> {
  store = this.props['store']

  @observable isHovering = false
  private ref = React.createRef<HTMLDivElement>()
  
  @computed get connectorState(): ConnectorState {
    return this.store.state(this.props.connector)
  }

  @computed get connectionsState(): string {
    return this.store.countConnections(this.props.connector) > 0 ? 'connected' : 'empty'
  }
  
  @computed get showTitle(): boolean {
    return this.isHovering || this.connectorState === 'hot' || this.connectorState === 'pending'
  }

  @computed get valueColor() {
    return colors.types[colorOfValueType(this.props.connector.type)]
  }

  @computed get fillColor(): string {
    return {
      'hot': {
        'empty': this.isHovering ? this.valueColor.hover : this.valueColor.highlight,
        'connected': this.isHovering ? this.valueColor.hover : this.valueColor.default
      }[this.connectionsState],
      'default': {
        'empty': (this.isHovering && !this.store.pendingConnector) ? this.valueColor.highlight: 'transparent',
        'connected': (this.isHovering && !this.store.pendingConnector) ? this.valueColor.highlight : this.valueColor.default,
      }[this.connectionsState],
      'pending': this.valueColor.hover
    }[this.connectorState]
  }

  @computed get cursor(): string {
    if (this.isHovering && this.store.pendingConnector && this.connectorState !== 'hot') {
      return 'not-allowed'
    }

    return 'pointer'
  }

  consume = e => {
    e.stopPropagation()
  }

  connect() {
    if (this.store.pendingConnector) {
      const from = this.store.connector.isSrc(this.store.pendingConnector)
        ? this.store.pendingConnector
        : this.props.connector
      const to = this.store.connector.isSrc(this.store.pendingConnector)
        ? this.props.connector
        : this.store.pendingConnector

      const connection: Connection = {
        id: this.store.uid(),
        from,
        to
      }

      this.store.connections.push(connection)
    }
  }

  unconnect(): Connector | undefined {
    const connection = this.store.connections.find(con => con.from === this.props.connector || con.to === this.props.connector)
    if (connection) {
      const other = connection.from === this.props.connector
        ? connection.to
        : connection.from

      this.store.connections = this.store.connections.filter(con => con !== connection)

      return other
    }
  }

  handleMouseOver = e => {
    this.isHovering = true
  }

  handleMouseOut = e => {
    this.isHovering = false
  }


  handleClick = e => {
    e.preventDefault()
    e.stopPropagation()

    if (this.store.pendingConnector) {
      if (this.store.connector.state(this.props.connector) === 'hot') {
        if (this.store.connector.countConnections(this.props.connector) > 0 && ['duplicate', 'single'].includes(this.props.connector.mode)) {
          this.connect()
          this.store.pendingConnector = this.unconnect() || null
          return
        }

        this.connect()
        this.store.pendingConnector = null    
        return
      }
      return
    }

    if (this.store.connector.countConnections(this.props.connector) > 0) {
      if (['duplicate', 'single'].includes(this.props.connector.mode)) {
        this.store.pendingConnector = this.unconnect() || null
        return
      }

      if (this.props.connector.mode === 'multiple') {
        this.store.pendingConnector = this.props.connector
      }

      return
    }

    this.store.pendingConnector = this.props.connector    
  }

  updatePosition = () => {
    if (this.ref.current) {
      const newPosition = {
        x: this.ref.current.offsetLeft + 30,
        y: this.ref.current.offsetTop + 30
      }

      if (!this.props.connector.position
        || newPosition.x !== this.props.connector.position.x
        || newPosition.y !== this.props.connector.position.y) {
        this.props.connector.position = newPosition
      }
    }
  }

  render () {
    const style: React.CSSProperties = {
      cursor: this.cursor,
      width: `${CONNECTOR_SIZE}px`,
      height: `${CONNECTOR_SIZE}px`,
      borderRadius: '50%',
      position: 'relative'
    }


    let positioning = {}
    const margin = 5
    if (this.props.connector.direction.x > 0) {
      positioning['left'] = `${CONNECTOR_SIZE + margin}px`
    }
    if (this.props.connector.direction.x < 0) {
      positioning['right'] = `${CONNECTOR_SIZE + margin}px`
    }
    if (this.props.connector.direction.y > 0) {
      positioning['top'] = `${CONNECTOR_SIZE + margin}px`
    }
    if (this.props.connector.direction.y < 0) {
      positioning['bottom'] = `${CONNECTOR_SIZE + margin}px`
    }
    if (this.props.connector.direction.y !== 0) {
      positioning['transform'] = 'translateY(-10px) rotate(-50deg)'
    }

    const titleStyle: React.CSSProperties = this.showTitle
      ? {
        position: 'absolute',
        ...positioning,
        pointerEvents: 'none',
        opacity: 0.9,
        lineHeight: `${CONNECTOR_SIZE}px`,
        fontSize: '30px',
        color: colors.text.white
      } : {
        display: 'none'
      }

    if (!isServer) {
      requestAnimationFrame(this.updatePosition)
    }

    const arrow = ['input', 'output'].includes(this.props.connector.function)
      ? <DownArrow fill={this.fillColor} stroke={this.valueColor.default} size={CONNECTOR_SIZE} />
      : <RightArrow fill={this.fillColor} stroke={this.valueColor.default} size={CONNECTOR_SIZE} />


    return <div ref={this.ref} style={style} onClick={this.handleClick} onMouseDown={this.consume} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
      <div style={titleStyle}>{this.props.connector.name}</div>
      {arrow}
    </div>
  }
}

export default ConnectorView