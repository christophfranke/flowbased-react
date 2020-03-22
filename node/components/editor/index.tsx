import React from 'react'
import { trace } from 'mobx'
import { observer } from 'mobx-react'

import { EditorNode } from '@editor/types'

import createNode from '@engine/create-node'
import createEditorNode from '@editor/create-node'

import Node from '@components/editor-node/node'
import Output from '@components/editor-node/output'

import tree from '@store/tree'

const RenderTypes = {
  Node,
  Output
}

@observer
class Editor extends React.Component {
  addEditorNode() {
    const node = createNode('Tag')
    const displayNode = createEditorNode(node)
    tree.displayNodes.push(displayNode)
  }

  renderEditorNode(node: EditorNode) {
    return React.createElement(RenderTypes[node.type], { node })
  }

  render() {
    return <div>
      <h2>I am the editor</h2>
      <button onClick={this.addEditorNode}>Create Node</button>
      <div className="relative border" style={{ height: `${tree.editor.sheetDimensions.y}px` }}>
        {tree.displayNodes.map(this.renderEditorNode)}
      </div>
    </div>
  }
}

export default Editor