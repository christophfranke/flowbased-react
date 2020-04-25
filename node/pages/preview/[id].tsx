import React from 'react'
import { observer, Provider } from 'mobx-react'
import { observable, computed } from 'mobx'
import Router, { withRouter } from 'next/router'
import fetch from 'isomorphic-fetch'

import Preview from '@editor/components/preview'
import Viewport from '@editor/components/viewport'

import Store from '@editor/store'

import graphStorage from '@service/graph-storage'
import loadDependencies from '@service/load-dependencies'

const currentId = () => window.location.pathname.split('/')[2]

@(withRouter as any)
@observer
class EditorLoad extends React.Component {
  @observable loading = true
  
  @computed get store(): Store | null {
    return graphStorage.stores[this.id] || null
  }

  @observable savedId: null
  @computed get id():string {
    return typeof window !== 'undefined'
      ? currentId()
      : ''
  }

  async fetchStore(id: string) {
    const result = await fetch(`/api/documents/${id}`)
    const data = await result.json()      
    graphStorage.stores[id] = Store.createFromData(data)

    return graphStorage.stores[id]
  }

  async fetchData() {
    this.loading = true
    const store = await this.fetchStore(this.id)
    await loadDependencies(store)

    this.loading = false
  }

  componentDidMount() {
    this.fetchData()
  }

  render() {
    if (!this.loading && this.store) {
      return <div>
        <Viewport dimensions={{ x: 0, y: 0, width: 100, height: 100 }}>
          <Preview store={this.store}/>
        </Viewport>
      </div>

    }

    return <div>
      loading...
    </div>
  }
}

export default EditorLoad