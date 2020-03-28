import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'

import { Vector, Rectangle, Node } from '@editor/types'
import { uid } from '@editor/util'
import NodeView from '@editor/node'

interface Props {
}

const clamp = (value, min, max) => Math.min(max, Math.max(value, min))

const LEFT_MOUSE_BUTTON = 0
const RIGHT_MOUSE_BUTTON = 2
const MAX_ZOOM = 4
const MIN_ZOOM = 0.25

@observer
class EditorView extends React.Component<Props> {
  @observable points: Vector[] = []
  @observable scale: number = 1
  @observable offset: Vector = { x: 0, y: 0}
  @observable dimensions: Rectangle
  @observable nodes: Node[] = []

  @computed get transformString() {
    return `scale(${this.scale}) translate(${this.offset.x}px, ${this.offset.y}px)`
  }
  @computed get transformMatrix() {
    return new DOMMatrix(this.transformString)
  }
  @computed get invertedTransformMatrix() {
    const matrix = new DOMMatrix(this.transformString)
    matrix.invertSelf()
    return matrix
  }

  mouseDownOffset: Vector
  rootRef = React.createRef<HTMLDivElement>()

  windowToView(input: Vector): Vector {
    const point = new DOMPoint(input.x, input.y)
    const out = point.matrixTransform(this.invertedTransformMatrix)
    return {
      x: out.x,
      y: out.y
    }
  }

  clientToWindow(input: Vector): Vector {
    return {
      x: input.x - this.dimensions.x,
      y: input.y - this.dimensions.y
    }
  }

  clientToView(input: Vector): Vector {
    return this.windowToView(this.clientToWindow(input))
  }

  handleRightMouseDown = e => {
    const id = uid()
    const node: Node = {
      id,
      name: `Node ${id}`,
      position: this.clientToView({ x: e.clientX, y: e.clientY }),
      connectors: {
        input: [{
          id: uid(),
          name: '',
          position: { x: 0, y: 0 }
        }],
        output: [{
          id: uid(),
          name: '',
          position: { x: 0, y: 0 }
        }]
      }
    }

    this.nodes.push(node)
  }

  handleMouseDown = e => {
    if (e.button === RIGHT_MOUSE_BUTTON) {
      this.handleRightMouseDown(e)
    } else if (e.button === LEFT_MOUSE_BUTTON) {
      this.handleLeftMouseDown(e)
    }
  }

  handleLeftMouseDown = e => {
    this.mouseDownOffset = {
      x: this.offset.x - e.clientX / this.scale,
      y: this.offset.y - e.clientY / this.scale
    }
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  handleMouseMove = e => {
    this.offset.x = this.mouseDownOffset.x + e.clientX / this.scale
    this.offset.y = this.mouseDownOffset.y + e.clientY / this.scale
  }

  handleMouseUp = e => {
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mousemove', this.handleMouseUp)
  }

  handleWheel = e => {
    const newScale = clamp(this.scale * Math.pow(2, -e.deltaY / 1000), MIN_ZOOM, MAX_ZOOM)
    const scaleChange = newScale / this.scale
    const mouse = this.clientToWindow({ x: e.clientX, y: e.clientY })
    this.offset.x += (1 - scaleChange) * mouse.x / this.scale
    this.offset.y += (1 - scaleChange) * mouse.y / this.scale
    this.scale = newScale
  }

  preventDefault(e) {
    e.preventDefault()
  }

  updateDimensions = () => {    
    const rect = this.rootRef.current && this.rootRef.current.getBoundingClientRect()
    if (rect) {    
      this.dimensions = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      }
    }
  }

  componentDidMount() {
    this.updateDimensions()
    window.addEventListener('contextmenu', this.preventDefault)
    window.addEventListener('wheel', this.preventDefault, { passive: false })
    window.addEventListener('resize', this.updateDimensions)
  }

  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.preventDefault)
    window.removeEventListener('wheel', this.preventDefault)
    window.removeEventListener('resize', this.updateDimensions)
  }

  render() {
    const outerStyle: React.CSSProperties = {
      height: '100%',
      width: '100%'
    }
    const innerStyle: React.CSSProperties = {
      position: 'absolute',
      width: '100%',
      height: '100%',
      transformOrigin: 'top left',
      transform: this.transformString,
      willChange: 'transform',
      border: '1 px solid grey'
    }

    // this.nodes.forEach(node => {
    //   console.log(node.value)
    // })

    return <div
      ref={this.rootRef}
      style={outerStyle}
      onMouseDown={this.handleMouseDown}
      onWheel={this.handleWheel}
     >
      <div style={innerStyle}>
        {this.nodes.map(node => <NodeView key={node.id} node={node} />)}
      </div>
    </div>
  }
}

export default EditorView