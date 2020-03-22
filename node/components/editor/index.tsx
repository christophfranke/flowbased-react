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
  addTextNode() {
    const node = createNode('Text', { text: '' })
    const displayNode = createEditorNode(node)
    tree.displayNodes.push(displayNode)
  }

  addTagNode() {
    const node = createNode('Tag', { tag: 'div' })
    const displayNode = createEditorNode(node)
    tree.displayNodes.push(displayNode)
  }

  renderEditorNode(node: EditorNode) {
    return React.createElement(RenderTypes[node.type], { node })
  }

  render() {
    return <div>
      <h2>I am the editor</h2>
      <button className="p-2 px-4 bg-blue-400 hover:bg-blue-200 mr-4" onClick={this.addTextNode}>Create Text Node</button>
      <button className="p-2 px-4 bg-teal-400 hover:bg-teal-200" onClick={this.addTagNode}>Create Tag Node</button>
      <div className="relative border" style={{ height: `${tree.editor.sheetDimensions.y}px` }}>
        {tree.displayNodes.map(this.renderEditorNode)}
      </div>
    </div>
  }
}

export default Editor