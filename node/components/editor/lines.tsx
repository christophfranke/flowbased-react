import React from 'react'
import { observer } from 'mobx-react'

import tree from '@store/tree'

@observer
class EditorLines extends React.Component<{}, {}> {
  render() {
    const lineStyle = {
      stroke: 'rgba(0, 0, 0, 1)',
      strokeWidth: '1'
    }

    const mousePosition = tree.editor.mousePosition

    return <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1001 }}>
      {tree.editor.pendingConnections.map(connection =>
        <line x1={connection.position.x} y1={connection.position.y} x2={mousePosition.x} y2={mousePosition.y} style={lineStyle} />)}
    </svg>
  }
}

export default EditorLines