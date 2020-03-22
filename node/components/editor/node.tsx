import React from 'react'

import { EditorNode } from '@editor/types'
import { observer } from 'mobx-react'

import tree from '@store/tree'

interface Props {
  node: EditorNode
}

interface State {
  transform: {
    x: number,
    y: number
  }
}

@observer
class EditorNodeComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      transform: {
        x: 0,
        y: 0
      }
    }

    this.mouseDown = this.mouseDown.bind(this)
    this.mouseMove = this.mouseMove.bind(this)
    this.mouseUp = this.mouseUp.bind(this)
  }

  active = false
  offset

  mouseDown(e) {
    this.active = true
    this.offset = {
      x: -e.clientX,
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
          x: this.offset.x + e.clientX,
          y: this.offset.y + e.clientY
        }
      })
    }
  }

  mouseUp(e) {
    this.active = false
    window.removeEventListener('mousemove', this.mouseMove)
    window.removeEventListener('mouseup', this.mouseUp)

    this.props.node.position = {
      x: this.props.node.position.x + this.state.transform.x,
      y: this.props.node.position.y + this.state.transform.y,
    }

    this.setState({
      transform: {
        x: 0,
        y: 0
      }
    })
  }

  render() {  
    const { node } = this.props
    const style = {
      zIndex: node.zIndex,
      minWidth: '200px',
      left: `${node.position.x}px`,
      top: `${node.position.y}px`,
      transform: `translate(${this.state.transform.x}px, ${this.state.transform.y}px)`
    }

    const mouseDown = node.movable
      ? this.mouseDown
      : () => {}

    return <div
      onMouseDown={mouseDown}
      className={`absolute p-5 border select-none bg-gray-100 ${node.movable ? 'cursor-move' : ''}`}
      style={style}>
      <h2>Type</h2>
      <select className="w-full" disabled={!node.editable}>
        <option>Combine</option>
        <option>Tag</option>
        <option>Text</option>
      </select>
    </div>
  }
}

export default EditorNodeComponent