import React from 'react'
import { trace } from 'mobx'
import { observer } from 'mobx-react'

import createNode from '@engine/create-node'
import createEditorNode from '@editor/create-node'

import EditorNode from '@components/editor/node'

import tree from '@store/tree'


@observer
class Editor extends React.Component {
  addEditorNode() {
    const node = createNode('Tag')
    const displayNode = createEditorNode(node)
    tree.displayNodes.push(displayNode)
  }

  render() {
    return <div>
      <h2>I am the editor</h2>
      <button onClick={this.addEditorNode}>Create Node</button>
      <div className="min-h-screen relative">
        {tree.displayNodes.map(node => <EditorNode node={node} />)}
      </div>
    </div>
  }
}

export default Editor