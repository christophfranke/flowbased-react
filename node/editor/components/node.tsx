import React from 'react'
import { computed, observable } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Node, Vector, ValueType } from '@editor/types'

import * as LA from '@editor/la'
import ConnectorView from '@editor/components/connector'
import { colors, colorOfType } from '@editor/colors'
import { isServer } from '@editor/util'
import Store from '@editor/store'
import { type } from '@engine/render'
import TextInput from '@editor/components/input/text'
import NumberInput from '@editor/components/input/number'
import CheckboxInput from '@editor/components/input/checkbox'
import TextareaInput from '@editor/components/input/textarea'
import TextlistInput from '@editor/components/input/textlist'
import TextpairsInput from '@editor/components/input/textpairs'

interface Props {
  node: Node
}


@inject('mouse', 'keys', 'store')
@observer
class NodeView extends React.Component<Props> {
  store: Store = this.props['store']
  nodeRef = React.createRef<HTMLDivElement>()
  offset: Vector
  relativePositions: {
    [id: number]: Vector
  }

  @observable isCloseHovering = false

  @computed get isSelected(): boolean {
    return this.store.selectedNodes.includes(this.props.node)
  }

  @computed get type(): ValueType {
    return type(this.store.translated.getNode(this.props.node))
  }

  handleCloseMouseOver = () => {
    this.isCloseHovering = true
  }

  handleCloseMouseOut= () => {
    this.isCloseHovering = false
  }

  handleClick = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  handleSelection() {
    const keys = this.props['keys']
    const relevantNodes = keys.Control
      ? this.store.getSubtree(this.props.node)
      : [this.props.node]

    if (keys.Shift) {
      if (this.isSelected) {
        // remove relevant nodes from selection
        this.store.selectedNodes = this.store.selectedNodes
          .filter(node => !relevantNodes.includes(node))
      } else {
        // add relevant nodes to selection
        this.store.selectedNodes = this.store.selectedNodes
          .concat(relevantNodes.filter(node => !this.store.selectedNodes.includes(node)))
      }
    } else {    
      if (!this.isSelected) {
        this.store.selectedNodes = relevantNodes
      }

      if (this.isSelected && relevantNodes.length > 1) {
        this.store.selectedNodes = relevantNodes
      }
    }
  }


  startDrag(position: Vector) {
    this.offset = LA.subtract(position, this.props.node.position)
    this.relativePositions = this.store.selectedNodes
      .filter(node => node !== this.props.node)
      .reduce((obj, node) => ({
        ...obj,
        [node.id]: LA.subtract(node.position, this.props.node.position)
      }), {})
  }

  moveDrag(position: Vector) {
    this.props.node.position = LA.subtract(position, this.offset)
    Object.entries(this.relativePositions).forEach(([id, position]) => {
      const node = this.store.getNodeById(Number(id))
      if (node) {
        node.position = LA.add(position, this.props.node.position)
      }
    })
  }

  handleMouseDown = e => {
    e.preventDefault()
    e.stopPropagation()

    this.handleSelection()

    const mouse = this.props['mouse'].position
    if (mouse) {
      this.startDrag(mouse)

      window.addEventListener('mousemove', this.handleMouseMove)
      window.addEventListener('mouseup', this.handleMouseUp)
    }
  }

  handleMouseMove = e => {
    const mouse = this.props['mouse'].position
    if (mouse) {
      this.moveDrag(mouse)
    }
  }

  handleMouseUp = () => {
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)
  }

  handleDelete = e => {
    e.stopPropagation()
    e.preventDefault()
    this.store.deleteNode(this.props.node)
  }

  updatePosition = () => {
    if (this.nodeRef.current) {
      this.props.node.boundingBox = {
        x: this.props.node.position.x,
        y: this.props.node.position.y,
        width: this.nodeRef.current.offsetWidth,
        height: this.nodeRef.current.offsetHeight
      }
    }
  }

  render() {
    if (!isServer) {
      requestAnimationFrame(this.updatePosition)
    }

    const { node } = this.props
    const typeColorBase = colorOfType(this.type)
    const typeColor = typeColorBase[this.isSelected ? 'highlight': 'default']

    const nodeStyle: React.CSSProperties = {
      padding: '10px',
      position: 'absolute',
      borderRadius: '10px',
      cursor: 'move',
      willChange: 'transform',
      transform: `translate(${this.props.node.position.x}px, ${this.props.node.position.y}px)`,
      color: colors.text.white,
      backgroundColor: colors.background[this.isSelected ? 'selected' : 'default'],
      border: `2px solid ${this.isCloseHovering ? colors.deleteNode : typeColor}`,
      boxShadow: this.isSelected
        ? `0 0 15px 0 ${this.isCloseHovering ? colors.deleteNode : typeColorBase.default}`
        : 'none'
    }

    const nameStyle: React.CSSProperties = {
      textAlign: 'center',
      fontSize: '24px',
      color: typeColor
    }

    const closeStyle: React.CSSProperties = {
      gridArea: 'close',
      transform: 'scale(1.7)',
      marginLeft: '10px',
      marginTop: '4px',
      color: this.isCloseHovering ? colors.deleteNode : typeColor,
      cursor: 'pointer'
    }

    const innerStyle: React.CSSProperties = {
      position: 'relative',
      display: 'grid',
      gridTemplate: `
        "props input close" auto
        "props params actions" auto
        "props output z" auto /
        1fr min-content 1fr`
    }

    return <div style={nodeStyle} onMouseDown={this.handleMouseDown} onClick={this.handleClick} ref={this.nodeRef}>
        <div style={innerStyle}>
          <div style={{ display: 'flex', justifyContent: 'center', gridArea: 'input' }}>
            {node.connectors.input.map(input => <ConnectorView key={input.id} connector={input} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gridArea: 'props' }}>
            {node.connectors.properties.map(property => <ConnectorView key={property.id} connector={property} />)}
          </div>
          <svg onClick={this.handleDelete} style={closeStyle} width="24" height="24" viewBox="0 0 24 24" onMouseOver={this.handleCloseMouseOver} onMouseOut={this.handleCloseMouseOut}>
            <use xlinkHref="/icons/close.svg#close" />
          </svg>
          <div style={{ gridArea: 'params' }}>
            <div style={nameStyle}>{node.name}</div>
            {node.params.map(param => {
              if (param.type === 'number') {
                return <NumberInput key={param.key} param={param} typeColor={typeColor} />
              }
              if (param.type === 'checkbox') {
                return <CheckboxInput key={param.key} param={param} typeColor={typeColor} />
              }
              if (param.type === 'textarea') {
                return <TextareaInput key={param.key} param={param} typeColor={typeColor} />
              }
              if (param.type === 'textlist') {
                return <TextlistInput key={param.key} param={param} typeColor={typeColor} />
              }
              if (param.type === 'pairs') {
                return <TextpairsInput key={param.key} param={param} typeColor={typeColor} />
              }
              return <TextInput key={param.key} param={param} typeColor={typeColor} />
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gridArea: 'output' }}>
            {node.connectors.output.map(output => <ConnectorView key={output.id} connector={output} />)}
          </div>
        </div>
      </div>
  }
}

export default NodeView