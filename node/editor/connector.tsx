import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

import { Connector, Vector } from '@editor/types'

interface Props {
  connector: Connector
}

@observer
class ConnectorView extends React.Component<Props> {
  @observable position: Vector
  ref = React.createRef<HTMLDivElement>()

  consume = e => {
    e.stopPropagation()
  }

  handleClick = e => {
    console.log('click!')
  }

  render () {
    const style = {
      border: '1px solid blue',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      margin: 'auto'
    }

    return <div ref={this.ref} style={style} onClick={this.handleClick} onMouseDown={this.consume} />
  }
}

export default ConnectorView