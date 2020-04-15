import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { ConnectorGroup } from '@editor/types'

import ConnectorView from '@editor/components/connector'

import Store from '@editor/store'


interface Props {
  group: ConnectorGroup
}

@inject('store')
@observer
class ConnectorGroupView extends React.Component<Props> {
  store: Store = this.props['store']

  render () {
    console.log(this.props.group)
    return <div>
      {this.props.group.connectors.map((connector, index) => <ConnectorView key={index} connector={connector} />)}
    </div>
  }
}

export default ConnectorGroupView