import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'

import { Vector } from '@editor/types'

interface Props {
}

const clamp = (value, min, max) => Math.min(max, Math.max(value, min))

const RIGHT_MOUSE_BUTTON = 2
@observer
class EditorView extends React.Component<Props> {
  @observable points: Vector[] = []
  @observable scale: number = 1
  @observable offset: Vector = { x: 0, y: 0}
  @computed get transformString() {
    return `translate(${this.offset.x}px, ${this.offset.y}px) scale(${this.scale})`
  }

  handleMouseDown = e => {
    if (e.button === RIGHT_MOUSE_BUTTON) {
      const point = new DOMPoint(e.clientX, e.clientY)
      const matrix = new DOMMatrix(this.transformString)
      matrix.invertSelf()
      console.log(matrix)

      const position: Vector = point.matrixTransform(matrix)
      this.points.push(position)

      console.log(point, position)
    }
  }

  handleScroll = e => {
    this.scale = clamp(this.scale * Math.pow(2, -e.deltaY / 1000), 0.5, 2)
  }

  preventDefault(e) {
    e.preventDefault()
  }

  componentDidMount() {
    window.addEventListener('contextmenu', this.preventDefault)
  }

  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.preventDefault)
  }

  render() {
    const outerStyle: React.CSSProperties = {
      height: '100%',
      width: '100%'
    }
    const innerStyle: React.CSSProperties = {
      position: 'absolute',
      width: '200%',
      height: '200%',
      transformOrigin: 'top left',
      transform: this.transformString,
      willChange: 'transform',
      border: '1 px solid grey'
    } 

    return <div style={outerStyle} onMouseDown={this.handleMouseDown} onWheel={this.handleScroll}>
      <div style={innerStyle}>
        {this.points.map(point => {
          const pointStyle: React.CSSProperties = {
            position: 'absolute',
            willChange: 'transform',
            transform: `translate(${point.x}px, ${point.y}px)`,
            backgroundColor: 'pink',
            borderRadius: '50%',
            width: '20px',
            height: '20px'
          }
          return <div style={pointStyle} onClick={() => console.log('hi', point.x)} />
        })}
        EditorView
      </div>
    </div>
  }
}

export default EditorView