import React from 'react'
import { observer } from 'mobx-react'
import { Parameter } from '@editor/types'
import { colors } from '@editor/colors'

import fontSize from '@editor/components/input/font-size'

interface Props {
  param: Parameter
  typeColor: string
}

@observer
class NumberInput extends React.Component<Props> {
  stop = e => {
    e.stopPropagation()
  }

  handleChange = e => {
    // const value = parseFloat(e.target.value)
    this.props.param.value = e.target.value
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
      <input type="number" style={inputStyle} value={param.value} onChange={this.handleChange} onMouseDown={this.stop} />
    </div>    
  }
}

export default NumberInput