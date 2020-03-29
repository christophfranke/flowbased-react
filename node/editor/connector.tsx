import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Connector, Connection, Vector, Node } from '@editor/types'

import { isServer, uid, connectors, canConnect } from '@editor/util'
import store from '@editor/store'

interface Props {
  connector: Connector
}


@observer
class ConnectorView extends React.Component<Props> {
  private ref = React.createRef<HTMLDivElement>()
  
  @computed get connectors(): Connector[] {
    return connectors(store.nodes)
  }

  consume = e => {
    e.stopPropagation()
  }

  handleClick = e => {
    e.preventDefault()
    e.stopPropagation()

    if (this.props.connector.state === 'default') {
      if (this.props.connector.connection === 'connected' && this.props.connector.mode === 'reconnect') {
        const connection = store.connections.find(con => con.from === this.props.connector || con.to === this.props.connector)
        if (connection) {
          const other = connection.from === this.props.connector
            ? connection.to
            : connection.from

          store.connections = store.connections.filter(con => con !== connection)

          this.props.connector.connection = 'empty'
          other.connection = 'empty'
          other.state = 'pending'
          this.connectors.forEach(third => {
            if (canConnect(other, third)) {
              third.state = 'hot'
            }
          })
        }
      } else {      
        this.props.connector.state = 'pending'
        this.connectors.forEach(other => {
          if (canConnect(this.props.connector, other)) {
            other.state = 'hot'
          }
        })
      }

      return
    }

    if (this.props.connector.state === 'hot') {
      const otherConnector = this.connectors.find(other => other.state === 'pending')
      if (otherConnector) {
        this.props.connector.state = 'default'
        this.props.connector.connection = 'connected'
        otherConnector.state = 'default'
        otherConnector.connection = 'connected'
        const connection: Connection = {
          id: uid(),
          from: this.props.connector,
          to: otherConnector
        }

        store.connections.push(connection)
      }

      this.connectors
        .forEach(connector => {
          connector.state = 'default'
        })
    }
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
      }[this.props.connector.connection],
      'pending': 'blue'
    }[this.props.connector.state]

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