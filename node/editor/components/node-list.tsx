import React from 'react'
import { observable, computed } from 'mobx'
import { inject, observer } from 'mobx-react'

import { nodeList } from '@editor/node'
import store from '@editor/store'


interface Props {
  onComplete(): void
  style: React.CSSProperties
}

const MAX_ITEMS = 6

@inject('mouse')
@observer
class NodeList extends React.Component<Props> {
  @observable mouse = this.props['mouse']
  @observable searchString = ''
  @observable selected = 0

  inputRef = React.createRef<HTMLInputElement>()
  
  @computed get filteredNodeList() {
    const regex = new RegExp(this.searchString.split('').join('.*'), 'i')
    return nodeList.filter(node => !!node.name.match(regex)).slice(0, MAX_ITEMS)
  }

  create = factory => {
    if (this.mouse.position) {
      store.nodes.push(factory(this.mouse.position))
      this.props.onComplete()
    }
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
      this.selected += 1
      if (this.selected >= this.filteredNodeList.length) {
        this.selected = 0
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      this.selected -= 1
      if (this.selected < 0) {
        this.selected = this.filteredNodeList.length - 1
      }
    }

    if (e.key === 'Enter') {
      if (this.filteredNodeList.length > this.selected) {
        this.create(this.filteredNodeList[this.selected].create)
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

    const itemStyleTemplate = {
      display: 'flex',
      justifyContent: 'space-between',
      cursor: 'pointer',
      padding: '0 5px'
    }

    const inputStyle = {
      outline: 'none'
    }

    return <div style={this.props.style}>
      <ul>
        <li><input style={inputStyle} ref={this.inputRef} value={this.searchString} onChange={this.handleChange} /></li>
        {this.filteredNodeList.map((item, index) => {
          const itemStyle = {
            ...itemStyleTemplate,
            borderTop: index > -1 ? '1px solid black' : 'none',
            backgroundColor: index === this.selected ? 'blue' : 'white',
            color: index === this.selected ? 'white' : 'black'
          }

          const mouseOver = () => {
            this.selected = index
          }

          return <li key={item.name} onClick={() => this.create(item.create)} style={itemStyle} onMouseOver={mouseOver}>
            <span>{item.name}</span>
            <span style={{ fontStyle: 'italic' }}>{item.type}</span>
          </li>
        })}
      </ul>
    </div>
  }
}

export default NodeList