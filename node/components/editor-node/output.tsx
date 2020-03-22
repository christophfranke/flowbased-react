import React from 'react'

import { EditorNode, EditorNodeProps } from '@editor/types'
import { observer } from 'mobx-react'

import InputConnector from '@components/editor/input-connector'

import tree from '@store/tree'


interface State {
  transform: {
    y: number
  }
}

@observer
class EditorOutputNodeComponent extends React.Component<EditorNodeProps, State> {
  constructor(props: EditorNodeProps) {
    super(props)

    this.state = {
      transform: {
        y: 0
      }
    }

    this.mouseDown = this.mouseDown.bind(this)
    this.mouseMove = this.mouseMove.bind(this)
    this.mouseUp = this.mouseUp.bind(this)
  }

  active = false
  offset: {
    y: number
  }

  mouseDown(e) {
    this.active = true
    this.offset = {
      y: -e.clientY
    }

    window.addEventListener('mousemove', this.mouseMove)
    window.addEventListener('mouseup', this.mouseUp)
    this.props.node.zIndex = tree.getHighZ()
  }

  mouseMove(e) {
    if (this.active) {
      this.setState({
        transform: {
          y: this.offset.y + e.clientY
        }
      })
    }
  }

  mouseUp(e) {
    this.active = false
    window.removeEventListener('mousemove', this.mouseMove)
    window.removeEventListener('mouseup', this.mouseUp)

    tree.editor.sheetDimensions.y += this.state.transform.y
    this.props.node.position.y = tree.editor.sheetDimensions.y

    this.setState({
      transform: {
        y: 0
      }
    })
  }

  render() {
    const { node } = this.props
    const style = {
      zIndex: 1000,
      bottom: 0,
      left: '50%',
      transform: `translate(-50%, ${this.state.transform.y}px)`
    }

    const mouseDown = node.movable
      ? this.mouseDown
      : () => {}

    return <div
      onMouseDown={mouseDown}
      className={`absolute p-5 border select-none bg-gray-100 ${node.movable ? 'cursor-move' : ''}`}
      style={style}>
      <InputConnector editorNode={node} className="mb-4" />
      <h2>Html Output</h2>
    </div>
  }
}

export default EditorOutputNodeComponent