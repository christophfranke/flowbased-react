import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Connector, Connection, Vector, Node } from '@editor/types'

import { isServer, uid, canConnect } from '@editor/util'
import { state } from '@editor/connector'
import store from '@editor/store'

interface Props {
  connector: Connector
}


@observer
class ConnectorView extends React.Component<Props> {
  private ref = React.createRef<HTMLDivElement>()
  
  consume = e => {
    e.stopPropagation()
  }

  connect() {
    if (store.pendingConnector) {
      this.props.connector.connections += 1
      store.pendingConnector.connections += 1
      const connection: Connection = {
        id: uid(),
        from: this.props.connector,
        to: store.pendingConnector
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

      this.props.connector.connections -= 1
      other.connections -= 1

      return other
    }
  }


  handleClick = e => {
    e.preventDefault()
    e.stopPropagation()

    if (store.pendingConnector) {
      if (state(this.props.connector) === 'hot') {
        if (this.props.connector.connections > 0 && this.props.connector.mode === 'reconnect') {
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

    if (this.props.connector.connections > 0) {
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
    const backgroundColor = {
      'hot': 'red',
      'default': {
        'empty': 'transparent',
        'connected': 'blue'
      }[this.props.connector.connections > 0 ? 'connected' : 'empty'],
      'pending': 'blue'
    }[state(this.props.connector)]

    const style = {
      border: '1px solid blue',
      backgroundColor,
      cursor: 'pointer',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      margin: 'auto'
    }

    if (!isServer) {
      requestAnimationFrame(this.updatePosition)
    }

    return <div ref={this.ref} style={style} onClick={this.handleClick} onMouseDown={this.consume} />
  }
}

export default ConnectorView