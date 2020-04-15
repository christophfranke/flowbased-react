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
    const editorNode = this.props.connector.group.ports.node
    const node = this.store.translated.getNode(editorNode)
    if (this.props.connector.group.function === 'output') {
      return type(node, this.store.context)
    }

    if (this.props.connector.group.function === 'input') {
      return expectedType(node, this.props.connector.group.key, this.store.context)
    }

    return this.store.context.definitions.Type.Unknown.create()
  }

  @computed get type(): ValueType {
    const editorNode = this.props.connector.group.ports.node
    const node = this.store.translated.getNode(editorNode)
    if (this.props.connector.group.function === 'output') {
      return type(node, this.store.context)
    }

    if (this.props.connector.group.function === 'input') {
    // if (['input', 'property'].includes(this.props.connector.function)) {        
    //   if (this.connections.length === 1) {
    //     const otherEditorNode = this.store.nodeOfConnector(this.connections[0].from)
    //     if (otherEditorNode) {
    //       return type(this.store.translated.getNode(otherEditorNode), this.store.context)
    //     }
    //   }
    // }

      return expectedType(node, this.props.connector.group.key, this.store.context)
    }


    return this.store.context.definitions.Type.Unknown.create()
  }

  @computed get typeDisplay(): string {
    return describe(this.type)
  }

  @computed get nameDisplay(): JSX.Element {
    const displayString = this.props.connector.group.name
      || (['input', 'output'].includes(this.props.connector.group.name)
        ? ''
        : this.props.connector.group.name)

    return displayString
      ? <>{displayString}: <span style={{ fontStyle: 'italic' }}>{this.typeDisplay}</span></>
      : <span style={{ fontStyle: 'italic' }}>{this.typeDisplay}</span>
  }

  consume = e => {
    e.stopPropagation()
  }

  connect() {
    if (this.store.pendingConnector) {
      const from = this.store.connector.isSrc(this.store.pendingConnector.group)
        ? this.store.pendingConnector
        : this.props.connector
      const to = this.store.connector.isSrc(this.store.pendingConnector.group)
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

  unconnect(): Connector | null {
    console.log('unconnect')
    const connection = this.connections.find(con => con.from === this.props.connector || con.to === this.props.connector)
    if (connection) {
      const other = connection.from === this.props.connector
        ? connection.to
        : connection.from

      this.store.connections = this.store.connections.filter(con => con !== connection)

      return other
    }

    return null
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
        if (this.store.connector.countConnections(this.props.connector) > 0 && ['duplicate', 'single'].includes(this.props.connector.group.mode)) {
          this.connect()
          this.store.pendingConnector = this.unconnect()
          return
        }

        this.connect()
        this.store.pendingConnector = null    
        return
      }
      return
    }

    if (this.store.connector.countConnections(this.props.connector) > 0) {
      if (['duplicate', 'single'].includes(this.props.connector.group.mode)) {
        this.store.pendingConnector = this.unconnect() || null
        return
      }

      if (this.props.connector.group.mode === 'multiple') {
        this.store.pendingConnector = this.props.connector
      }

      return
    }

    this.store.pendingConnector = this.props.connector    
  }

  componentDidMount() {
    const el = this.ref.current
    if (el) {
      this.props.connector.position = {
        x: el.offsetLeft + 30,
        y: el.offsetTop + 30
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
    if (this.props.connector.group.direction.x > 0) {
      positioning['left'] = `${CONNECTOR_SIZE + margin}px`
    }
    if (this.props.connector.group.direction.x < 0) {
      positioning['right'] = `${CONNECTOR_SIZE + margin}px`
      if (this.store.connector.state(this.props.connector) === 'hot' && !this.isHovering) {
        positioning['padding'] = '0'
        positioning['border'] = 'none'
        positioning['color'] = colors.text.mediumDim
      }
    }
    if (this.props.connector.group.direction.y > 0) {
      positioning['top'] = `${CONNECTOR_SIZE + margin}px`
    }
    if (this.props.connector.group.direction.y < 0) {
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

    const arrow = ['input', 'output'].includes(this.props.connector.group.function)
      ? <DownArrow fill={this.fillColor} stroke={this.borderValueColor.default} size={CONNECTOR_SIZE} />
      : <RightArrow fill={this.fillColor} stroke={this.borderValueColor.default} size={CONNECTOR_SIZE} />


    return <div ref={this.ref} style={style} onClick={this.handleClick} onMouseDown={this.consume} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
      <div style={titleStyle}>{this.nameDisplay}</div>
      {arrow}
    </div>
  }
}

export default ConnectorView