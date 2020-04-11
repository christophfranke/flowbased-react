import React from 'react'
import { observer } from 'mobx-react'
import { Parameter } from '@editor/types'
import { colors } from '@editor/colors'

interface Props {
  param: Parameter
  typeColor: string
}

@observer
class CheckboxInput extends React.Component<Props> {
  stop = e => {
    e.stopPropagation()
  }

  handleClick = e => {
    this.props.param.value = !this.props.param.value
  }

  render() {
    const labelStyle: React.CSSProperties = {
      color: colors.text.dim,
      fontSize: '16px',
      marginRight: '8px'
    }

    const boxStyle: React.CSSProperties = {
      backgroundColor: colors.background.default,
      cursor: 'pointer',
      marginBottom: '8px',
      minWidth: '85px',
      display: 'inline',
      fontSize: '20px',
      borderBottom: `1px solid ${this.props.typeColor}`,
    }

    const param = this.props.param
    const label = param.name
      ? <label style={labelStyle}>{param.name}</label>
      : null

    return <div key={param.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {label}
      <div style={boxStyle} onMouseDown={this.stop} onClick={this.handleClick}>{param.value ? 'True' : 'False'}</div>
    </div>    
  }
}

export default CheckboxInput