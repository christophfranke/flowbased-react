import { observable, reaction, IReactionDisposer, runInAction } from 'mobx'
import graphStorage from '@service/graph-storage'
import Store from '@editor/store'

const isServer = typeof window === 'undefined'
const base = isServer
  ? 'http://localhost:3000'
  : `${window.location.protocol}//${window.location.host}`


class ServerSync {
  disposer: IReactionDisposer

  enableSaving() {
    console.log('enabled saving')
    this.disposer = reaction(() => {
      return Object.values(graphStorage.stores).map(store => store.version)
    },
    () => {
      return Promise.all(Object.entries(graphStorage.stores)
        .filter(([id, store]) => store.version > 0)
        .map(([id, store]) => {
          console.log('saving', store.name, store.version)
          return fetch(`/api/documents/${id}`, {
            method: 'POST',
            body: JSON.stringify(store.data)
          })
        }))
    }, {
      // autosave maximum once per second
      delay: 1000
    })
  }

  disableSaving() {
    if (this.disposer) {
      this.disposer()
    }
  }

  fetched: { [key: string]: boolean } = {}
  async fetchOnce(id: string) {
    if (!this.fetched[id]) {
      this.fetched[id] = true
      console.log('fetching', id)

      const url = `${base}/api/documents/${id}`
      const result = await fetch(url)
      const data = await result.json()

      runInAction(async () => {
        if (!graphStorage.stores[id]) {
          graphStorage.stores[id] = new Store()
        }

        const store = graphStorage.stores[id]
        store.fillWithData(data)
      })

      await Promise.all<any>(graphStorage.stores[id].nodes.map(node => {
        if (!graphStorage.modules[node.module]) {
          return this.fetchOnce(node.module)
        }

        return Promise.resolve()
      }))
    }
  }

  async load(id: string) {
    this.fetched = {}
    await this.fetchOnce(id)
  }

  async delete(id: string) {
    const result = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    })
  }
}


export default ServerSync