import React from 'react'
import { trace } from 'mobx'
import { observer } from 'mobx-react'

import EditorNode from '@components/editor/node'

import tree from '@store/tree'

@observer
class Editor extends React.Component {
  render() {
    return <div>
      <h2>I am the editor</h2>
      <div className="min-h-screen relative">
        {tree.display.map(node => <EditorNode node={node} />)}
      </div>
    </div>
  }
}

export default Editor