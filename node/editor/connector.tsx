import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Connector, Connection, Vector, Node } from '@editor/types'

import { isServer, uid, connectors } from '@editor/util'

interface Props {
  connector: Connector
}

@inject('nodes', 'connections')
@observer
class ConnectorView extends React.Component<Props> {
  private ref = React.createRef<HTMLDivElement>()
  
  nodes: Node[] = this.props['nodes']
  connections: Connection[] = this.props['connections']
  @computed get connectors(): Connector[] {
    return connectors(this.nodes)
  }

  consume = e => {
    e.stopPropagation()
  }

  handleClick = e => {
    e.preventDefault()
    e.stopPropagation()

    if (this.props.connector.state === 'empty') {
      this.props.connector.state = 'pending'
      this.connectors.forEach(connector => {
        if (connector.state === 'empty') {
          connector.state = 'hot'
        }
      })
    }

    if (this.props.connector.state === 'hot') {
      const otherConnector = this.connectors.find(other => other.state === 'pending')
      if (otherConnector) {
        this.props.connector.state = 'connected'
        otherConnector.state = 'connected'
        const connection: Connection = {
          id: uid(),
          from: this.props.connector,
          to: otherConnector
        }

        this.connections.push(connection)
      }

      this.connectors
        .filter(connector => connector.state === 'pending' || connector.state === 'hot')
        .forEach(connector => {
          connector.state = 'empty'
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
      'connected': 'blue',
      'hot': 'red',
      'empty': 'transparent',
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