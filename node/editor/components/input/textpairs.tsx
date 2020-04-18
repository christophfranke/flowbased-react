import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { Parameter } from '@editor/types'
import { colors } from '@editor/colors'

import fontSize from '@editor/components/input/font-size'

interface Props {
  param: Parameter
  typeColor: string
}

@observer
class TextListInput extends React.Component<Props> {
  stop = e => {
    e.stopPropagation()
  }

  @observable entries: {
    key: string
    value: string
  }[] = []

  handleChange = (e, index, where: 'key' | 'value') => {
    this.entries[index][where] = e.target.value
    this.props.param.value = this.entries.filter(({ key }) => key)
      .reduce((obj, { key, value }) => ({
        ...obj,
        [key]: value
      }), {})
    this.updateTextList()
  }

  updateTextList = () => {
    const firstEmptyIndex = this.entries.findIndex(({ key, value }) => !key && !value)
    if (this.entries.filter(({ key, value }) => !key && !value).length > 1) {
      this.entries = this.entries
        .filter(({key, value }, index) => index <= firstEmptyIndex || key || value)
    }

    if (this.entries.every(({ key, value }) => key || value)) {
      this.entries.push({ key: '', value: '' })
    }
  }

  componentDidMount() {
    const value = this.props.param.value as { [key: string]: string }
    this.entries = Object.entries(value)
      .map(([key, value]) => ({
        key,
        value
      }))
    this.updateTextList()
  }

  render() {
    const labelStyle: React.CSSProperties = {
      color: colors.text.dim,
      fontSize: fontSize.label
    }

    const inputStyle: React.CSSProperties = {
      outline: 'none',
      backgroundColor: colors.background.default,
      minWidth: '200px',
      width: '100%',
      margin: '8px',
      fontSize: fontSize.input,
      borderBottom: `1px solid ${this.props.typeColor}`,
    }

    const param = this.props.param
    return <div key={param.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <label style={labelStyle}>{param.name}</label>
        <div>
          {this.entries.map(({ key, value }, index) => {
            return <div style={{ display: 'flex' }}>
              <input type="text" style={inputStyle} value={key} onChange={e => this.handleChange(e, index, 'key')} onMouseDown={this.stop} />
              <input type="text" style={inputStyle} value={value} onChange={e => this.handleChange(e, index, 'value')} onMouseDown={this.stop} />
            </div>
          })}
      </div>
    </div>    
  }
}

export default TextListInput