import React from 'react'
import { observer } from 'mobx-react'

import tree from '@store/tree'
import { renderNode } from '@engine/render'

@observer
class RenderView extends React.Component {
  render() {
    return <div>
      RenderView is on.
      <div>
        {renderNode(tree.root)}
      </div>
    </div>
  }
}

export default RenderView