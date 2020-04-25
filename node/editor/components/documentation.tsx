import React from 'react'
import { observer, inject } from 'mobx-react'

import Store from '@editor/store'
import { colors } from '@editor/colors'

interface Props {
  nodeType: string
  nodeModule: string
  style?: React.CSSProperties
}

const replacementMap = {
  italic: {
    all: '(\\*[^\*]+\\*)',
    inner: /\*([^\*]+)\*/,
    replace: token => <i key={Math.random()}>{token}</i>
  },
  code: {
    all: '(`[^`]+`)',
    inner: /`([^`]+)`/,
    replace: token => <pre style={{
        display: 'inline-block',
        backgroundColor: colors.background.editor,
        border: '1px solid rgba(255, 255, 255, 0.4)'
      }}>{token}</pre>
  }
}

const format = text => text
  .split(new RegExp(Object.values(replacementMap).map(rules => rules.all).join('|')))
  .filter(token => !!token)
  .map(token => Object.values(replacementMap)
    .reduce((currentToken: any, rule) => typeof currentToken === 'string' && currentToken.match(rule.inner)
      ? rule.replace(currentToken.match(rule.inner)![1])
      : currentToken, token))


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
        <div style={{ display: 'grid', gridTemplate, fontSize: '16px', gridGap: '10px' }}>
          {Object.entries(obj[key]).map(([type, description]: [string, string]) => <>
              <span key={type} style={{ fontWeight: 'bold' }}>{type}:</span>
              <span>{format(description)}</span>
            </>)}
        </div>
      </div>
    }
  }

  handleWheel = e => {
    if (e.currentTarget.scrollHeight > e.currentTarget.clientHeight) {
      e.stopPropagation()
    }
  }

  render() {
    const definition = this.store.modules[this.props.nodeModule].EditorNode[this.props.nodeType]
    const documentation = definition.documentation

    const style: React.CSSProperties = {
      minWidth: '30vw',
      maxWidth: '60vw',
      maxHeight: '75vh',
      overflowY: 'auto',
      backgroundColor: colors.background.default,
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid white',
      color: 'white',
      textAlign: 'left'
    }

    return <div style={this.props.style || {}}>
      <div style={style} onWheel={this.handleWheel}>
        <div>
          <h1 style={{ fontSize: '20px', marginBottom: '5px' }}>
            <span style={{ fontSize: '14px'}}>{this.props.nodeModule}</span>.{definition.name}
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
