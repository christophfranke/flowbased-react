import React from 'react'
import { observer } from 'mobx-react'
import { Parameter } from '@editor/types'
import { colors } from '@editor/colors'

interface Props {
  param: Parameter
  typeColor: string
}

@observer
class TextListInput extends React.Component<Props> {
  stop = e => {
    e.stopPropagation()
  }

  handleChange = (e, index) => {
    this.props.param.value[index] = e.target.value
    this.updateValues()
  }

  updateValues = () => {
    const firstEmptyIndex = this.props.param.value.findIndex(text => !text)
    if (this.props.param.value.filter(text => !text).length > 1) {
      this.props.param.value = this.props.param.value
        .filter((text, index) => index <= firstEmptyIndex || text)
    }
    if (this.props.param.value.every(text => text)) {
      this.props.param.value.push('')
    }
  }

  componentDidMount() {
    this.updateValues()
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
      <div>
        {param.value.map((text, index) => {
          return <input type="text" style={inputStyle} value={text} onChange={e => this.handleChange(e, index)} onMouseDown={this.stop} />
        })}
      </div>
    </div>    
  }
}

export default TextListInput