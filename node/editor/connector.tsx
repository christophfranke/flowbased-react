import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

import { Connector, Vector } from '@editor/types'

import { isServer } from '@editor/util'

interface Props {
  connector: Connector
}

@observer
class ConnectorView extends React.Component<Props> {
  private ref = React.createRef<HTMLDivElement>()

  consume = e => {
    e.stopPropagation()
  }

  handleClick = e => {
    if (this.props.connector.state === 'empty') {
      this.props.connector.state = 'hot'
    }
  }

  updatePosition = () => {
    if (this.ref.current) {
      this.props.connector.position = {
        x: this.ref.current.offsetLeft,
        y: this.ref.current.offsetTop
      }
    }
  }

  render () {
    const style = {
      border: '1px solid blue',
      cursor: 'pointer',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      margin: 'auto'
    }

    if (!isServer) {
      requestAnimationFrame(this.updatePosition)
    }

    return <div ref={this.ref} style={style} onClick={this.handleClick} onMouseDown={this.consume} />
  }
}

export default ConnectorView