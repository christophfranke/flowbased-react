import React from 'react'
import { observable, computed, action } from 'mobx'
import { inject, observer } from 'mobx-react'

import Store from '@editor/store'

import { Vector } from '@editor/types'
import { colors } from '@editor/colors'

import Documentation from '@editor/components/documentation'


interface Props {
  onComplete(): void
  style: React.CSSProperties
  position: Vector
}

const MAX_ITEMS = 50

@inject('store')
@observer
class NodeList extends React.Component<Props> {
  store: Store = this.props['store']
  inputRef = React.createRef<HTMLInputElement>()

  @observable searchString = ''
  @observable selected = 0
  
  @computed get selectedShown() {
    return Math.min(this.selected, this.filteredNodeList.length - 1)
  }

  @computed get filteredNodeList() {
    const regex = new RegExp(this.searchString.split('').filter(l => l !== ' ').map(l => l === '.' ? '\\.' : l).join('.*'), 'i')
    const nodeString = node => `${node.moduleName}.${node.name}:${node.type}`
    return this.store.node.nodeList.filter(node => !!nodeString(node).match(regex)).slice(0, MAX_ITEMS)
  }

  @computed get selectedItem() {
    return this.selectedShown >= 0
      ? this.filteredNodeList[this.selectedShown]
      : null
  }

  create = factory => {
    factory(this.props.position)
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
      if (this.selectedItem) {
        this.create(this.selectedItem.create)
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
      padding: '3px 8px'
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
      <div style={{ display: 'flex' }}>
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

            return <li key={`${item.module}.${item.type}`} onClick={(e) => this.handleClick(e, item.create)} style={itemStyle} onMouseOver={mouseOver}>
              <span style={nameStyle}><span style={{ fontSize: '10px' }}>{item.moduleName}</span>.{item.name}</span>
              <span style={{ fontStyle: 'italic' }}>{item.typeDisplay}</span>
            </li>
          })}
        </ul>
        {this.selectedItem && <Documentation style={{ marginLeft: '10px' }} nodeType={this.selectedItem.type} nodeModule={this.selectedItem.module} />}
      </div>
    </div>
  }
}

export default NodeList