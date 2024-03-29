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
      fontSize: fontSize.label,
    }

    const boxStyle: React.CSSProperties = {
      backgroundColor: colors.background.default,
      cursor: 'pointer',
      minWidth: '85px',
      width: '100%',
      display: 'inline',
      fontSize: fontSize.input,
      borderBottom: `1px solid ${this.props.typeColor}`,
    }

    const param = this.props.param
    const label = param.name
      ? <label style={labelStyle}>{param.name}</label>
      : null

    return <>
      {label}
      <div style={boxStyle} onMouseDown={this.stop} onClick={this.handleClick}>{param.value ? 'True' : 'False'}</div>
    </>
  }
}

export default CheckboxInput