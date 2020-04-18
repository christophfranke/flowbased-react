import React from 'react'
import { observer, inject } from 'mobx-react'

import Store from '@editor/store'
import { colors } from '@editor/colors'

interface Props {
  nodeType: string
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
        <h2 style={{ fontSize: '20px', marginTop: '20px' }}>{key}</h2>
        <div style={{ display: 'grid', gridTemplate }}>
          {Object.entries(obj[key]).map(([type, description]: [string, string]) => <>
              <span key={type} style={{ marginRight: '10px', fontWeight: 'bold' }}>{[''].includes(type) ? 'default' : type}:</span>
              <span>{format(description)}</span>
            </>)}
        </div>
      </div>
    }
  }

  render() {
    const documentation = this.store.definitions.EditorNode[this.props.nodeType].documentation

    const style: React.CSSProperties = {
      minWidth: '700px',
      backgroundColor: colors.background.default,
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid white'
    }

    console.log(format(documentation.explanation))

    return <div style={this.props.style || {}}>
      <div style={style}>
        <div>
          <h1 style={{ fontSize: '24px'}}>{this.props.nodeType}</h1>
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
