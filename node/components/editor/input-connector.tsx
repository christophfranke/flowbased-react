import React from 'react'

import { PendingConnection, EditorNode } from '@editor/types'
import connect from '@engine/connect'

import tree from '@store/tree'

interface Props {
  editorNode: EditorNode
  className?: string
}

class InputConnector extends React.Component<Props> {
  constructor(props: Props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    // connect pending connections
    if (tree.editor.pendingConnections.some(connection => connection.type === 'Outgoing')) {
      tree.editor.pendingConnections.forEach(connection => {
        connect(connection.node, this.props.editorNode.node)
      })
      tree.editor.pendingConnections = []
    } else {
      const connection: PendingConnection = {
        type: 'Incoming',
        node: this.props.editorNode.node,
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

export default InputConnector