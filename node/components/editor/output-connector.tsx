import React from 'react'

import { Node } from '@engine/types'
import { PendingConnection, EditorNode } from '@editor/types'
import engineConnect from '@engine/connect'
import editorConnect from '@editor/connect'

import tree from '@store/tree'

interface Props {
  editorNode: EditorNode
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
        engineConnect(this.props.editorNode.node, connection.editorNode.node)
        editorConnect(this.props.editorNode, connection.editorNode)
      })
      tree.editor.pendingConnections = []
    } else {
      const connection: PendingConnection = {
        type: 'Outgoing',
        editorNode: this.props.editorNode,
        position: tree.editor.mousePosition
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