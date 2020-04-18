import React from 'react'
import { observer, inject } from 'mobx-react'

import Store from '@editor/store'
import { colors } from '@editor/colors'

interface Props {
  nodeType: string
  nodeModule: string
  style?: React.CSSProperties
}

const regex = /(\*[^\*]+\*)/
const format = text => text.split(regex)
  .map(token => token.match(regex)
    ? <i>{token.substring(1, token.length - 1)}</i>
    : token)

@inject('store')
@observer
class Documentation extends React.Component<Props> {
  store: Store = this.props['store']

  renderConnectors(obj, key) {
    if (obj[key]) {
      const gridTemplate = `
        "key value" auto /
        auto 1fr
      `

      return <div>
        <hr style={{ marginTop: '15px', borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        <h2 style={{ fontSize: '18px', marginTop: '15px', marginBottom: '5px' }}>{key}</h2>
        <div style={{ display: 'grid', gridTemplate, fontSize: '14px' }}>
          {Object.entries(obj[key]).map(([type, description]: [string, string]) => <>
              <span key={type} style={{ marginRight: '10px', fontWeight: 'bold' }}>{[''].includes(type) ? 'default' : type}:</span>
              <span>{format(description)}</span>
            </>)}
        </div>
      </div>
    }
  }

  render() {
    const documentation = this.store.modules[this.props.nodeModule].EditorNode[this.props.nodeType].documentation

    const style: React.CSSProperties = {
      minWidth: '700px',
      backgroundColor: colors.background.default,
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid white',
      color: 'white'
    }

    return <div style={this.props.style || {}}>
      <div style={style}>
        <div>
          <h1 style={{ fontSize: '20px', marginBottom: '5px' }}>
            <span style={{ fontSize: '14px'}}>{this.props.nodeModule}</span>.{this.props.nodeType}
          </h1>
          {format(documentation.explanation)}
        </div>
        {this.renderConnectors(documentation, 'input')}
        {this.renderConnectors(documentation, 'params')}
        {this.renderConnectors(documentation, 'output')}
      </div>
    </div>
  }
}

export default Documentation
