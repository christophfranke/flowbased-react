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
class TextInput extends React.Component<Props> {
  stop = e => {
    e.stopPropagation()
  }

  render() {
    const labelStyle: React.CSSProperties = {
      color: colors.text.dim,
      fontSize: fontSize.label
    }

    const inputStyle: React.CSSProperties = {
      outline: 'none',
      backgroundColor: colors.background.default,
      minWidth: '120px',
      width: '100%',
      fontSize: fontSize.input,
      borderBottom: `1px solid ${this.props.typeColor}`,
    }

    const param = this.props.param
    return <>
      <label style={labelStyle}>{param.name}</label>
      <input type="text" style={inputStyle} value={param.value || ''} onChange={(e) => param.value = e.target.value} onMouseDown={this.stop} />
    </>
  }
}

export default TextInput