import React from 'react'

import { Node } from '@engine/types'
import { PendingConnection } from '@editor/types'
import connect from '@engine/connect'

import tree from '@store/tree'

interface Props {
  node: Node
  className?: string
}

class OutputConnector extends React.Component<Props> {
  constructor(props: Props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    // connect pending connections
    if (tree.editor.pendingConnections.some(connection => connection.type === 'Incoming')) {
      tree.editor.pendingConnections.forEach(connection => {
        connect(this.props.node, connection.node)
      })
      tree.editor.pendingConnections = []
    } else {
      const connection: PendingConnection = {
        type: 'Outgoing',
        node: this.props.node,
        get position() {
          return {
            x: 0,
            y: 0
          }
        }
      }
      tree.editor.pendingConnections.push(connection)
    }
  }

  render() {
    return <div className={`flex justify-center ${this.props.className}`}>
      <div className="p-4 border w-1 cursor-pointer" onClick={this.handleClick} />
    </div>
  }
}

export default OutputConnector