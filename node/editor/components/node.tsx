import React from 'react'
import { computed, observable, action } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Node, Vector, ValueType, Connector, Parameter, Ports } from '@editor/types'

import * as LA from '@editor/la'
import { colors, colorOfType } from '@editor/colors'
import { isServer } from '@editor/util'
import Store from '@editor/store'
import { type } from '@engine/render'

import ConnectorGroup from '@editor/components/connector-group'
import Documentation from '@editor/components/documentation'

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
  @observable isDocumentationVisible = false  

  @computed get ports(): Ports {
    return this.store.connector.ports(this.props.node)
  }

  @computed get params(): Parameter[] {
    return this.props.node.params
  }

  offset: Vector
  relativePositions: {
    [id: number]: Vector
  }

  @observable isCloseHovering = false

  @computed get isSelected(): boolean {
    return this.store.selectedNodes.includes(this.props.node)
  }

  @computed get type(): ValueType {
    return type(this.store.translated.getNode(this.props.node), this.store.context)
  }

  @action
  handleCloseMouseOver = () => {
    this.isCloseHovering = true
  }

  @action
  handleCloseMouseOut= () => {
    this.isCloseHovering = false
  }

  handleClick = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  @action
  showHelp = () => {
    this.isDocumentationVisible = true
  }

  @action
  hideHelp = (e) => {
    if (!this.props['keys'][' ']) {
      this.isDocumentationVisible = false
    }
  }

  @action
  handleSelection() {
    const keys = this.props['keys']
    const relevantNodes = keys.Control
      ? this.store.getSubtree(this.props.node)
      : [this.props.node]

    if (keys.Shift) {
      if (this.isSelected) {
        // remove relevant nodes from selection
        this.store.selectNodes(this.store.selectedNodes
          .filter(node => !relevantNodes.includes(node)))
      } else {
        // add relevant nodes to selection
        this.store.selectNodes(this.store.selectedNodes
          .concat(relevantNodes.filter(node => !this.store.selectedNodes.includes(node))))
      }
    } else {    
      if (!this.isSelected) {
        this.store.selectNodes(relevantNodes)
      }

      if (this.isSelected && relevantNodes.length > 1) {
        this.store.selectNodes(relevantNodes)
      }
    }
  }


  @action
  startDrag(position: Vector) {
    this.offset = LA.subtract(position, this.props.node.position)
    this.relativePositions = this.store.selectedNodes
      .filter(node => node !== this.props.node)
      .reduce((obj, node) => ({
        ...obj,
        [node.id]: LA.subtract(node.position, this.props.node.position)
      }), {})
  }

  @action
  moveDrag(position: Vector) {
    this.props.node.position = LA.subtract(position, this.offset)
    Object.entries(this.relativePositions).forEach(([id, position]) => {
      const node = this.store.getNodeById(Number(id))
      if (node) {
        node.position = LA.add(position, this.props.node.position)
      }
    })
  }

  @action
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

  @action
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

  @action
  handleDelete = e => {
    e.stopPropagation()
    e.preventDefault()
    this.store.deleteNode(this.props.node)
  }

  @action
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

    const node = this.props.node
    const definition = this.store.nodeDefinition(node) || {}
    const typeColorBase = colorOfType(this.type)
    const typeColor = typeColorBase[this.isSelected ? 'highlight': 'default']

    const nodeStyle: React.CSSProperties = {
      pointerEvents: this.props['keys'][' '] ? 'none' : 'auto',
      padding: '10px',
      position: 'absolute',
      borderRadius: '10px',
      cursor: 'move',
      zIndex: this.props.node.zIndex,
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
      fontSize: '18px',
      whiteSpace: 'nowrap',
      cursor: 'help',
      display: 'inline',
      color: typeColor
    }

    const closeStyle: React.CSSProperties = {
      gridArea: 'close',
      transform: 'scale(1.4)',
      marginLeft: '10px',
      marginTop: '1px',
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

    const documentationStyle: React.CSSProperties = {
      position: 'absolute'
    }

    return <div style={nodeStyle} onMouseDown={this.handleMouseDown} onClick={this.handleClick} ref={this.nodeRef} onMouseLeave={this.hideHelp}>
        <div style={innerStyle}>
          <div style={{ display: 'flex', justifyContent: 'center', gridArea: 'input' }}>
            {this.ports.input.main.map(group => <ConnectorGroup key={group.key} group={group} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gridArea: 'props' }}>
            {this.ports.input.side.map(group => <ConnectorGroup key={group.key} group={group} vertical />)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gridArea: 'output' }}>
            {this.ports.output.main.map(group => <ConnectorGroup key={group.key} group={group} />)}
          </div>
          <svg onClick={this.handleDelete} style={closeStyle} width="24" height="24" viewBox="0 0 24 24" onMouseOver={this.handleCloseMouseOver} onMouseOut={this.handleCloseMouseOut}>
            <use xlinkHref="/icons/close.svg#close" />
          </svg>
          <div style={{ gridArea: 'params', textAlign: 'center' }}>
            <div style={nameStyle} onClick={this.showHelp}>{definition.name}</div>
            {this.isDocumentationVisible && <Documentation nodeType={this.props.node.type} nodeModule={this.props.node.module} style={documentationStyle} />}
            <div style={{ display: 'grid', gridTemplate: '"label input" auto / auto auto', gridGap: '4px 8px', alignItems: 'center', textAlign: 'left' }}>
              {this.params.map(param => {
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
                if (param.type === 'text') {
                  return <TextInput key={param.key} param={param} typeColor={typeColor} />
                }
              })}
            </div>
          </div>
        </div>
      </div>
  }
}

export default NodeView