import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { ConnectorGroup } from '@editor/types'

import ConnectorView from '@editor/components/connector'

import Store from '@editor/store'


interface Props {
  group: ConnectorGroup
  vertical?: boolean
}

@inject('store')
@observer
class ConnectorGroupView extends React.Component<Props> {
  store: Store = this.props['store']

  render () {
    const style = {
      display: this.props.vertical ? 'block' : 'flex',
      justifyContent: this.props.group.direction.x > 0 ? 'flex-end' : 'flex-start'
    }

    return <div style={style}>
      {this.props.group.connectors.map((connector, index) => <ConnectorView key={index} connector={connector} />)}
    </div>
  }
}

export default ConnectorGroupView