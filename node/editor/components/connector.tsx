import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Connector, ConnectorState, Connection, Vector, Node, ValueType } from '@editor/types'

import { isServer } from '@editor/util'
import { rotate90, rotate270, scale } from '@editor/la'
import { colors, colorOfType } from '@editor/colors'
import { describe } from '@shared/type-display'
import { type, expectedType } from '@engine/render'
import Store from '@editor/store'
import * as TypeDefinition from '@engine/type-definition'

import DownArrow from '@editor/components/down-arrow'
import RightArrow from '@editor/components/right-arrow'

interface Props {
  connector: Connector
}

const CONNECTOR_SIZE = 40

@inject('store')
@observer
class ConnectorView extends React.Component<Props> {
  store: Store = this.props['store']

  @observable isHovering = false
  private ref = React.createRef<HTMLDivElement>()

  @computed get connections(): Connection[] {
    return this.store.connector.getConnections(this.props.connector)
  }
  
  @computed get connectorState(): ConnectorState {
    return this.store.connector.state(this.props.connector)
  }

  @computed get connectionsState(): string {
    return this.store.connector.countConnections(this.props.connector) > 0 ? 'connected' : 'empty'
  }
  
  @computed get showTitle(): boolean {
    return this.isHovering || this.connectorState === 'hot' || this.connectorState === 'pending'
  }

  @computed get valueColor() {
    return colorOfType(this.type)
  }

  @computed get borderValueColor() {
    return colorOfType(this.expectedType)
  }

  @computed get fillColor(): string {
    return {
      'hot': {
        'empty': this.isHovering ? this.valueColor.hover : this.valueColor.highlight,
        'connected': this.isHovering ? this.valueColor.hover : this.valueColor.default
      }[this.connectionsState],
      'default': {
        'empty': (this.isHovering && !this.store.pendingConnector) ? this.valueColor.highlight: 'transparent',
        'connected': (this.isHovering && !this.store.pendingConnector) ? this.valueColor.highlight : this.valueColor.default,
      }[this.connectionsState],
      'pending': this.valueColor.hover
    }[this.connectorState]
  }

  @computed get cursor(): string {
    if (this.isHovering && this.store.pendingConnector && this.connectorState !== 'hot') {
      return 'not-allowed'
    }

    return 'pointer'
  }

  @computed get expectedType(): ValueType {
    const editorNode = this.store.nodeOfConnector(this.props.connector)
    if (editorNode) {
      const node = this.store.translated.getNode(editorNode)
      if (this.props.connector.function === 'output') {
        return type(node)
      }

      if (this.props.connector.function === 'input') {
        return expectedType(node)
      }
      if (this.props.connector.function === 'property') {
        return expectedType(node, this.props.connector.name)
      }
    }

    return TypeDefinition.Unknown
  }

  @computed get type(): ValueType {
    const editorNode = this.store.nodeOfConnector(this.props.connector)
    if (editorNode) {
      const node = this.store.translated.getNode(editorNode)
      if (this.props.connector.function === 'output') {
        return type(node)
      }

      if (['input', 'property'].includes(this.props.connector.function)) {        
        if (this.connections.length === 1) {
          const otherEditorNode = this.store.nodeOfConnector(this.connections[0].from)
          if (otherEditorNode) {
            return type(this.store.translated.getNode(otherEditorNode))
          }
        }
      }

      if (this.props.connector.function === 'input') {
        return expectedType(node)
      }
      if (this.props.connector.function === 'property') {
        return expectedType(node, this.props.connector.name)
      }
    }

    return TypeDefinition.Unknown
  }

  @computed get typeDisplay(): string {
    return describe(this.type)
  }

  @computed get nameDisplay(): JSX.Element {
    if (['input', 'output'].includes(this.props.connector.name)) {
      return <span style={{ fontStyle: 'italic' }}>{this.typeDisplay}</span>
    }

    return <>{this.props.connector.name}: <span style={{ fontStyle: 'italic' }}>{this.typeDisplay}</span></>
  }

  consume = e => {
    e.stopPropagation()
  }

  connect() {
    if (this.store.pendingConnector) {
      const from = this.store.connector.isSrc(this.store.pendingConnector)
        ? this.store.pendingConnector
        : this.props.connector
      const to = this.store.connector.isSrc(this.store.pendingConnector)
        ? this.props.connector
        : this.store.pendingConnector

      const connection: Connection = {
        id: this.store.uid(),
        from,
        to
      }

      this.store.connections.push(connection)
    }
  }

  unconnect(): Connector | undefined {
    const connection = this.connections.find(con => con.from === this.props.connector || con.to === this.props.connector)
    if (connection) {
      const other = connection.from === this.props.connector
        ? connection.to
        : connection.from

      this.store.connections = this.store.connections.filter(con => con !== connection)

      return other
    }
  }

  handleMouseOver = e => {
    this.isHovering = true
  }

  handleMouseOut = e => {
    this.isHovering = false
  }


  handleClick = e => {
    e.preventDefault()
    e.stopPropagation()

    if (this.store.pendingConnector) {
      if (this.store.connector.state(this.props.connector) === 'hot') {
        if (this.store.connector.countConnections(this.props.connector) > 0 && ['duplicate', 'single'].includes(this.props.connector.mode)) {
          this.connect()
          this.store.pendingConnector = this.unconnect() || null
          return
        }

        this.connect()
        this.store.pendingConnector = null    
        return
      }
      return
    }

    if (this.store.connector.countConnections(this.props.connector) > 0) {
      if (['duplicate', 'single'].includes(this.props.connector.mode)) {
        this.store.pendingConnector = this.unconnect() || null
        return
      }

      if (this.props.connector.mode === 'multiple') {
        this.store.pendingConnector = this.props.connector
      }

      return
    }

    this.store.pendingConnector = this.props.connector    
  }

  updatePosition = () => {
    if (this.ref.current) {
      const newPosition = {
        x: this.ref.current.offsetLeft + 30,
        y: this.ref.current.offsetTop + 30
      }

      if (!this.props.connector.position
        || newPosition.x !== this.props.connector.position.x
        || newPosition.y !== this.props.connector.position.y) {
        this.props.connector.position = newPosition
      }
    }
  }

  render () {
    const style: React.CSSProperties = {
      cursor: this.cursor,
      width: `${CONNECTOR_SIZE}px`,
      height: `${CONNECTOR_SIZE}px`,
      borderRadius: '50%',
      position: 'relative',
    }

    if (this.isHovering) {
      style.zIndex = 1
    }


    let positioning = {}
    const margin = 5
    if (this.props.connector.direction.x > 0) {
      positioning['left'] = `${CONNECTOR_SIZE + margin}px`
    }
    if (this.props.connector.direction.x < 0) {
      positioning['right'] = `${CONNECTOR_SIZE + margin}px`
      if (this.store.connector.state(this.props.connector) === 'hot' && !this.isHovering) {
        positioning['padding'] = '0'
        positioning['border'] = 'none'
        positioning['color'] = colors.text.mediumDim
      }
    }
    if (this.props.connector.direction.y > 0) {
      positioning['top'] = `${CONNECTOR_SIZE + margin}px`
    }
    if (this.props.connector.direction.y < 0) {
      positioning['bottom'] = `${CONNECTOR_SIZE + margin}px`
      if (this.store.connector.state(this.props.connector) === 'hot' && !this.isHovering) {
        positioning['transformOrigin'] = 'bottom left'
        positioning['transform'] = `translateX(${CONNECTOR_SIZE}px) rotate(-90deg)`
        positioning['padding'] = '0'
        positioning['border'] = 'none'
        positioning['color'] = colors.text.mediumDim
      }
    }

    const titleStyle: React.CSSProperties = this.showTitle
      ? {
        position: 'absolute',
        pointerEvents: 'none',
        opacity: 0.9,
        padding: '20px',
        backgroundColor: colors.background.default,
        lineHeight: `${CONNECTOR_SIZE}px`,
        fontSize: '30px',
        whiteSpace: 'nowrap',
        color: colors.text.white,
        border: `2px solid ${this.fillColor}`,
        borderRadius: '8px',
        ...positioning,
      } : {
        display: 'none'
      }

    if (!isServer) {
      requestAnimationFrame(this.updatePosition)
    }

    const arrow = ['input', 'output'].includes(this.props.connector.function)
      ? <DownArrow fill={this.fillColor} stroke={this.borderValueColor.default} size={CONNECTOR_SIZE} />
      : <RightArrow fill={this.fillColor} stroke={this.borderValueColor.default} size={CONNECTOR_SIZE} />


    return <div ref={this.ref} style={style} onClick={this.handleClick} onMouseDown={this.consume} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
      <div style={titleStyle}>{this.nameDisplay}</div>
      {arrow}
    </div>
  }
}

export default ConnectorView