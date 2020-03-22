import React from 'react'
import { observer } from 'mobx-react'

import { Vector } from '@editor/types'

import tree from '@store/tree'

const line = (pos1: Vector, pos2: Vector, style: Object) => <line x1={pos1.x} y1={pos1.y} x2={pos2.x} y2={pos2.y} style={style} />

const startOffset = {
  x: 126,
  y: 215
}

const endOffset = {
  x: 126,
  y: 128
}

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
        line(connection.position, mousePosition, lineStyle))}
      {tree.editor.establishedConnections.map(connection => {
        const start = {
          x: tree.percentageToPx(connection.src.position.x) + startOffset.x,
          y: connection.src.position.y + startOffset.y
        }
        const end = {
          x: tree.percentageToPx(connection.target.position.x) + endOffset.x,
          y: connection.target.position.y + endOffset.y
        }

        return line(start, end, lineStyle)
      })}
    </svg>
  }
}

export default EditorLines