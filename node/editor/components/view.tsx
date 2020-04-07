import React from 'react'
import { observable, computed, autorun, IReactionDisposer } from 'mobx'
import { observer, Provider } from 'mobx-react'
import normalizeWheel from 'normalize-wheel';

import { Vector, Rectangle, Node, Connector, Connection, Mouse } from '@editor/types'
import { uid } from '@editor/util'
import { colors } from '@editor/colors'
import * as LA from '@editor/la'

import NodeView from '@editor/components/node'
import PendingConnections from '@editor/components/pennding-connections'
import Connections from '@editor/components/connections'
import NodeList from '@editor/components/node-list'

import store from '@editor/store'


const clamp = (value, min, max) => Math.min(max, Math.max(value, min))

const LEFT_MOUSE_BUTTON = 0
const RIGHT_MOUSE_BUTTON = 2
const MAX_ZOOM = 2
const MIN_ZOOM = 0.1

@observer
class EditorView extends React.Component {
  backgroundColor = colors.background.editor
  dispose: IReactionDisposer

  initialSelection: Node[] | null
  @observable points: Vector[] = []
  @observable scale: number = 1
  @observable offset: Vector = { x: 0, y: 0}
  @observable dimensions: Rectangle
  @observable mouse: Mouse = {}
  @observable nodeListPosition: Vector | null = null
  @observable keys: { [key: string]: boolean } = {}
  @observable selectionRectangle: Rectangle | null = null

  @computed get drawableSelectionRectangle(): Rectangle | null {
    if (!this.selectionRectangle) {
      return null
    }

    const rect = this.selectionRectangle
    return {
      x: rect.width < 0
        ? rect.width + rect.x
        : rect.x,
      y: rect.height < 0
        ? rect.height + rect.y
        : rect.y,
      width: Math.abs(rect.width),
      height: Math.abs(rect.height)
    }
  }

  @computed get isPanningMode() {
    return !!this.keys[' ']
  }

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

  private mouseDownOffset: Vector | null = null
  private rootRef = React.createRef<HTMLDivElement>()

  windowToViewRectangle(input: Rectangle): Rectangle {
    const topLeft = {
      x: input.x,
      y: input.y
    }
    const bottomRight = {
      x: input.x + input.width,
      y: input.y + input.height
    }

    const transformed = {
      topLeft: this.windowToView(topLeft),
      bottomRight: this.windowToView(bottomRight)
    }

    return {
      x: transformed.topLeft.x,
      y: transformed.topLeft.y,
      width: transformed.bottomRight.x - transformed.topLeft.x,
      height: transformed.bottomRight.y - transformed.topLeft.y
    }
  }

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

  mouseEventToView(e): Vector {
    return this.clientToView({ x: e.clientX, y: e.clientY })
  }

  updateMousePosition = e => {
    this.mouse.position = this.mouseEventToView(e)
  }

  handleMouseOut = e => {
    if (e.currentTarget.contains(e.target) || e.target === e.currentTarget) {
      this.mouse.position = undefined
    }
  }

  handleClick = () => {
    if (!this.isPanningMode) {
      store.pendingConnector = null
      this.nodeListPosition = null
      if (this.selectionRectangle) {
        this.selectionRectangle = null
      } else {
        store.selectedNodes = []
      }
    }
  }

  handleRightMouseDown = e => {
    this.nodeListPosition = this.clientToWindow({ x: e.clientX, y: e.clientY })
  }

  handleNodeCreated = () => {
    this.nodeListPosition = null
  }

  handleMouseDown = e => {
    if (e.button === RIGHT_MOUSE_BUTTON) {
      this.handleRightMouseDown(e)
    } else if (e.button === LEFT_MOUSE_BUTTON) {
      this.handleLeftMouseDown(e)
    }
  }

  handleLeftMouseDown = e => {
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  handleMouseMove = e => {
    if (this.isPanningMode) {
      this.selectionRectangle = null
      if (!this.mouseDownOffset) {
        this.mouseDownOffset = {
          x: this.offset.x - e.clientX / this.scale,
          y: this.offset.y - e.clientY / this.scale
        }
      }

      this.offset.x = this.mouseDownOffset.x + e.clientX / this.scale
      this.offset.y = this.mouseDownOffset.y + e.clientY / this.scale
    } else {
      this.mouseDownOffset = null
      if (!this.selectionRectangle) {
        const position = this.clientToWindow({ x: e.clientX, y: e.clientY })
        this.selectionRectangle = {
          ...position,
          width: 0,
          height: 0
        }        
      }

      const position = this.clientToWindow({ x: e.clientX, y: e.clientY })
      this.selectionRectangle.width = position.x - this.selectionRectangle.x
      this.selectionRectangle.height = position.y - this.selectionRectangle.y
    }
  }

  handleMouseUp = e => {
    this.mouseDownOffset = null
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mousemove', this.handleMouseUp)
  }

  handleWheel = e => {
    const normalized = normalizeWheel(e.nativeEvent)
    const newScale = clamp(this.scale * Math.pow(2, -normalized.pixelY / 1000), MIN_ZOOM, MAX_ZOOM)
    const scaleChange = newScale / this.scale
    const mouse = this.clientToWindow({ x: e.clientX, y: e.clientY })
    this.offset.x += (1 - scaleChange) * mouse.x / this.scale
    this.offset.y += (1 - scaleChange) * mouse.y / this.scale
    this.scale = newScale
  }

  preventDefault = e => {
    if (this.mouse.position) {
      e.preventDefault()
    }
  }

  handleKeydown = e => {
    this.keys[e.key] = true
  }

  handleKeyup = e => {
    this.keys[e.key] = false
    if (e.key === 'Backspace') {
      store.deleteNodes(store.selectedNodes)
    }
  }

  handleKeypress = e => {}

  selectWithRectangle = () => {
    if (this.drawableSelectionRectangle) {
      if (!this.initialSelection) {
        this.initialSelection = store.selectedNodes
      }
      const rectangle: Rectangle = this.windowToViewRectangle(this.drawableSelectionRectangle)
      const selected = store.nodes.filter(node => node.boundingBox)
        .filter(node => LA.intersects(rectangle, node.boundingBox!))

      if (this.keys.Shift) {
        const stillSelected = this.initialSelection.filter(node => !selected.includes(node))
        const freshSelected = selected.filter(node => !this.initialSelection!.includes(node))
        store.selectedNodes = stillSelected.concat(freshSelected)
      } else {
        store.selectedNodes = selected
      }
    } else {
      if (this.initialSelection) {
        this.initialSelection = null
      }
    }
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
    window.addEventListener('keydown', this.handleKeydown)
    window.addEventListener('keyup', this.handleKeyup)
    window.addEventListener('keypress', this.handleKeypress)
    this.dispose = autorun(this.selectWithRectangle)
    store.initialize()
  }

  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.preventDefault)
    window.removeEventListener('wheel', this.preventDefault)
    window.removeEventListener('resize', this.updateDimensions)
    window.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('keyup', this.handleKeyup)
    window.removeEventListener('keypress', this.handleKeypress)
    this.dispose()
  }

  render() {
    const outerStyle: React.CSSProperties = {
      height: '100%',
      width: '100%',
      userSelect: 'none',
      backgroundColor: this.backgroundColor,
      cursor: this.isPanningMode ? 'grab' : 'auto'
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


    const nodeListStyle: React.CSSProperties = this.nodeListPosition ? {
      position: 'fixed',
      left: `${this.nodeListPosition.x}px`,
      top: `${this.nodeListPosition.y}px`
    } : {}

    const nodeList = this.nodeListPosition
      ? <NodeList onComplete={this.handleNodeCreated} style={nodeListStyle} position={this.windowToView(this.nodeListPosition)} />
      : null

    const selectionRectangle = this.selectionRectangle ? <svg style={{ overflow: 'visible', position: 'absolute' }}>
      <g fill="none" stroke={colors.selectionRectangle} strokeWidth="1">
        <rect {...this.drawableSelectionRectangle} />
      </g>
    </svg> : null

    return <div
      ref={this.rootRef}
      style={outerStyle}
      onMouseDown={this.handleMouseDown}
      onWheel={this.handleWheel}
      onMouseMove={this.updateMousePosition}
      onMouseOut={this.handleMouseOut}
      onClick={this.handleClick}
     >
      <Provider mouse={this.mouse} keys={this.keys}>
        <div style={innerStyle}>
          <Connections />
          {store.nodes.map(node => <NodeView key={node.id} node={node} />)}
          <PendingConnections />
        </div>
        {nodeList}
        {selectionRectangle}
      </Provider>
    </div>
  }
}

export default EditorView