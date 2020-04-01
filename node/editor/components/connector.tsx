import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Connector, ConnectorState, Connection, Vector, Node } from '@editor/types'

import { isServer, uid } from '@editor/util'
import { rotate90, rotate270, scale } from '@editor/la'
import { countConnections, canConnect } from '@editor/connector'
import { state } from '@editor/connector'
import store from '@editor/store'

import DownArrow from '@editor/components/down-arrow'
import RightArrow from '@editor/components/right-arrow'

interface Props {
  connector: Connector
}


@observer
class ConnectorView extends React.Component<Props> {
  @observable isHovering = false
  private ref = React.createRef<HTMLDivElement>()
  
  @computed get connectorState(): ConnectorState {
    return state(this.props.connector)
  }
  
  @computed get showTitle(): boolean {
    return this.isHovering || this.connectorState === 'hot' || this.connectorState === 'pending'
  }

  consume = e => {
    e.stopPropagation()
  }

  connect() {
    if (store.pendingConnector) {
      const connection: Connection = {
        id: uid(),
        from: store.pendingConnector,
        to: this.props.connector
      }

      store.connections.push(connection)
    }
  }

  unconnect(): Connector | undefined {
    const connection = store.connections.find(con => con.from === this.props.connector || con.to === this.props.connector)
    if (connection) {
      const other = connection.from === this.props.connector
        ? connection.to
        : connection.from

      store.connections = store.connections.filter(con => con !== connection)

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

    if (store.pendingConnector) {
      if (state(this.props.connector) === 'hot') {
        if (countConnections(this.props.connector) > 0 && this.props.connector.mode === 'reconnect') {
          this.connect()
          store.pendingConnector = this.unconnect() || null
          return
        }

        this.connect()
        store.pendingConnector = null    
        return
      }
      return
    }

    if (countConnections(this.props.connector) > 0) {
      if (this.props.connector.mode === 'reconnect') {
        store.pendingConnector = this.unconnect() || null
        return
      }

      if (this.props.connector.mode === 'multiple') {
        store.pendingConnector = this.props.connector
      }

      return
    }

    store.pendingConnector = this.props.connector    
  }

  updatePosition = () => {
    if (this.ref.current) {
      this.props.connector.position = {
        x: this.ref.current.offsetLeft + 0.5 * this.ref.current.clientWidth,
        y: this.ref.current.offsetTop + 0.5 * this.ref.current.clientHeight
      }
    }
  }

  render () {
    const fill = {
      'hot': this.isHovering ? 'blue': 'red',
      'default': {
        'empty': (this.isHovering && !store.pendingConnector) ? 'blue': 'transparent',
        'connected': 'blue'
      }[countConnections(this.props.connector) > 0 ? 'connected' : 'empty'],
      'pending': 'blue'
    }[this.connectorState]

    const size = 20

    const style: React.CSSProperties = {
      cursor: 'pointer',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      position: 'relative'
    }


    let positioning = {}
    const margin = 5
    if (this.props.connector.direction.x > 0) {
      positioning['left'] = `${size + margin}px`
    }
    if (this.props.connector.direction.x < 0) {
      positioning['right'] = `${size + margin}px`
    }
    if (this.props.connector.direction.y > 0) {
      positioning['top'] = `${size + margin}px`
    }
    if (this.props.connector.direction.y < 0) {
      positioning['bottom'] = `${size + margin}px`
    }
    if (this.props.connector.direction.y !== 0) {
      positioning['transform'] = 'translateY(-5px) rotate(-50deg)'
    }

    const titleStyle: React.CSSProperties = this.showTitle
      ? {
        position: 'absolute',
        ...positioning,
        pointerEvents: 'none',
        opacity: 0.9,
        lineHeight: `${size}px`,
        backgroundColor: 'white'
      } : {
        display: 'none'
      }

    if (!isServer) {
      requestAnimationFrame(this.updatePosition)
    }

    const arrow = ['input', 'output'].includes(this.props.connector.function)
      ? <DownArrow fill={fill} stroke="blue" size={size} />
      : <RightArrow fill={fill} stroke="blue" size={size} />


    return <div ref={this.ref} style={style} onClick={this.handleClick} onMouseDown={this.consume} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
      <div style={titleStyle}>{this.props.connector.name}</div>
      {arrow}
    </div>
  }
}

export default ConnectorView