import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

import Store from '@editor/store'

import { load } from '@shared/local-storage-sync'

import Preview from '@editor/components/preview'

import graphStorage from '@service/graph-storage'
import loadDependencies from '@service/load-dependencies'


@observer
class LivePreview extends React.Component {
  @observable store: Store = new Store()

  updateStore = () => {
    this.store.nodes = load(['editor', 'nodes']) || []
    this.store.connections = load(['editor', 'connections']) || []
    this.store.currentHighZ = load(['editor', 'currentHighZ']) || 1
    this.store.name = load(['editor', 'name']) || ''    
  }

  componentDidMount() {
    this.updateStore()
    window.addEventListener('storage', this.updateStore)
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.updateStore)

  }

  render() {
    return this.store
      ? <Preview store={this.store} />
      : <div>Initializing live preview...</div>
  }
}

export default LivePreview