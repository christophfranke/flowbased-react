import React from 'react'
import { observer } from 'mobx-react'

import tree from '@store/tree'
import { renderNode } from '@engine/render'

@observer
class Renderer extends React.Component {
  render() {
    const output = tree.root ? renderNode(tree.root) : null
    return <div>
      Renderer is on.
      <div>
        {output}
      </div>
    </div>
  }
}

export default Renderer