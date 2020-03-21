import React from 'react'
import { observer } from 'mobx-react'

import tree from '@store/tree'
import { renderNode } from '@engine/render'

@observer
class Renderer extends React.Component {
  render() {
    return <div>
      Renderer is on.
      <div>
        {renderNode(tree.root)}
      </div>
    </div>
  }
}

export default Renderer