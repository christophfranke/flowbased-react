import React from 'react'
import { observer } from 'mobx-react'
import { Parameter } from '@editor/types'
import { colors } from '@editor/colors'

interface Props {
  param: Parameter
  typeColor: string
}

@observer
class NumberInput extends React.Component<Props> {
  stop = e => {
    e.stopPropagation()
  }

  render() {
    const labelStyle: React.CSSProperties = {
      color: colors.text.dim,
      fontSize: '16px'
    }

    const inputStyle: React.CSSProperties = {
      outline: 'none',
      backgroundColor: colors.background.default,
      minWidth: '200px',
      width: '100%',
      margin: '8px',
      fontSize: '20px',
      borderBottom: `1px solid ${this.props.typeColor}`,
    }

    const param = this.props.param
    return <div key={param.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <label style={labelStyle}>{param.name}</label>
      <input type="number" style={inputStyle} value={param.value || ''} onChange={(e) => param.value = parseFloat(e.target.value)} onMouseDown={this.stop} />
    </div>    
  }
}

export default NumberInput