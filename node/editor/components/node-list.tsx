import React from 'react'
import { observable, computed } from 'mobx'
import { inject, observer } from 'mobx-react'

import { Vector } from '@editor/types'
import { nodeList } from '@editor/node'
import { colors } from '@editor/colors'
import store from '@editor/store'


interface Props {
  onComplete(): void
  style: React.CSSProperties
  position: Vector
}

const MAX_ITEMS = 6

@observer
class NodeList extends React.Component<Props> {
  @observable searchString = ''
  @observable selected = 0
  inputRef = React.createRef<HTMLInputElement>()
  
  @computed get selectedShown() {
    return Math.min(this.selected, this.filteredNodeList.length - 1)
  }

  @computed get filteredNodeList() {
    const regex = new RegExp(this.searchString.split('').join('.*'), 'i')
    return nodeList.filter(node => !!node.name.match(regex)).slice(0, MAX_ITEMS)
  }

  create = factory => {
    store.nodes.push(factory(this.props.position))
    this.props.onComplete()
  }

  handleClick = (e, factory) => {
    e.preventDefault()
    e.stopPropagation()
    this.create(factory)
  }

  handleKeyDown = e => {
    if (e.key === 'Esc' || e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      this.props.onComplete()
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      this.selected = this.selectedShown + 1
      if (this.selected >= this.filteredNodeList.length) {
        this.selected = 0
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      this.selected = this.selectedShown - 1
      if (this.selected < 0) {
        this.selected = this.filteredNodeList.length - 1
      }
    }

    if (e.key === 'Enter') {
      if (this.selectedShown >= 0) {
        this.create(this.filteredNodeList[this.selectedShown].create)
      }
    }
  }

  handleChange = e => {
    this.searchString = e.target.value
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  render() {
    requestAnimationFrame(() => {
      if (this.inputRef.current) {
        this.inputRef.current.focus()
      }
    })

    const itemStyleTemplate: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      cursor: 'pointer',
      padding: '0 5px'
    }

    const inputStyle: React.CSSProperties = {
      outline: 'none',
      width: '100%',
      backgroundColor: colors.nodeList.input.background,
      color: colors.nodeList.input.color
    }

    const nameStyle: React.CSSProperties = {
      display: 'inline-block',
      marginRight: '15px',
      whiteSpace: 'nowrap'
    }

    return <div style={this.props.style}>
      <ul>
        <li><input style={inputStyle} ref={this.inputRef} value={this.searchString} onChange={this.handleChange} /></li>
        {this.filteredNodeList.map((item, index) => {
          const itemStyle = {
            ...itemStyleTemplate,
            borderTop: index > -1 ? `1px solid ${colors.nodeList.border}` : 'none',
            backgroundColor: index === this.selectedShown ? colors.nodeList.background.selected : colors.nodeList.background.default,
            color: index === this.selectedShown ? colors.nodeList.text.selected : colors.nodeList.text.default
          }

          const mouseOver = () => {
            this.selected = index
          }

          return <li key={item.name} onClick={(e) => this.handleClick(e, item.create)} style={itemStyle} onMouseOver={mouseOver}>
            <span style={nameStyle}>{item.name}</span>
            <span style={{ fontStyle: 'italic' }}>{item.type}</span>
          </li>
        })}
      </ul>
    </div>
  }
}

export default NodeList