import React from 'react'
import { observable, action } from 'mobx'
import { observer } from 'mobx-react'

import Store from '@editor/store'

import { load } from '@shared/local-storage-sync'

import Preview from '@editor/components/preview'

import graphStorage from '@service/graph-storage'
import loadDependencies from '@service/load-dependencies'


@observer
class LivePreview extends React.Component {
  @observable store: Store = new Store()

  @action
  updateStore = () => {
    const data = {
      nodes: load(['editor', 'nodes']) || [],
      connections: load(['editor', 'connections']) || [],
      currentHighZ: load(['editor', 'currentHighZ']) || 1,
      name: load(['editor', 'name']) || ''
    }

    this.store.fillWithData(data)
  }

  componentDidMount() {
    this.updateStore()
    // window.addEventListener('storage', this.updateStore)
  }

  componentWillUnmount() {
    // window.removeEventListener('storage', this.updateStore)
  }

  render() {
    const nameOverlay = <div style={{ position: 'fixed', right: '1vw', top: '1vw', fontSize: '16px', color: 'white', padding: '5px 10px', backgroundColor: 'rgba(25, 25, 25, 0.6)', borderRadius: '8px', border: '1px solid white', pointerEvents: 'none' }}>
      {this.store ? this.store.name : ''}
    </div>

    return <React.Fragment>
      {nameOverlay}
      {this.store
        ? <Preview store={this.store} />
        : <div>Initializing live preview...</div>}
    </React.Fragment>
  }
}

export default LivePreview