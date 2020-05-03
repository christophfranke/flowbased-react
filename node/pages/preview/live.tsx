import React from 'react'
import { observable, action, computed } from 'mobx'
import { observer } from 'mobx-react'

import Store from '@editor/store'

import Preview from '@editor/components/preview'

import graphStorage from '@service/graph-storage'
import LocalStorageSync from '@service/local-storage-sync'


@observer
class LivePreview extends React.Component {
  @observable sync: LocalStorageSync
  @computed get id(): string {
    return this.sync && this.sync.selectedStoreId || ''
  }

  @computed get store(): Store | undefined {
    return this.id 
      ? graphStorage.stores[this.id]
      : undefined
  }

  componentDidMount() {
    this.sync = new LocalStorageSync()
    this.sync.enableReceiving()
  }

  componentWillUnmount() {
    this.sync.disableReceiving()
  }

  render() {
    const nameOverlay = <div style={{ position: 'fixed', right: '1vw', top: '1vw', fontSize: '16px', color: 'white', padding: '5px 10px', backgroundColor: 'rgba(25, 25, 25, 0.6)', borderRadius: '8px', border: '1px solid white', pointerEvents: 'none' }}>
      {this.store ? this.store.name : ''}
    </div>

    return <React.Fragment>
      {nameOverlay}
      {this.store
        ? <Preview key={this.id} store={this.store} />
        : <div>Initializing live preview...</div>}
    </React.Fragment>
  }
}

export default LivePreview