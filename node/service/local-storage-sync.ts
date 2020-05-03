import { observable, runInAction, reaction, IReactionDisposer } from 'mobx'
import graphStorage from '@service/graph-storage'
import Store from '@editor/store'

class LocalStorageSync {
  @observable selectedStoreId: string | null = null
  disposer: IReactionDisposer
  version = 0

  enableSending() {
    this.disposer = reaction(() => {
      return Object.values(graphStorage.stores).map(store => store.version)
    },
    () => {
      Object.entries(graphStorage.stores).forEach(([id, store]) => {
        window.localStorage.setItem(id, JSON.stringify(store.data))
      })
    }, {
      // autosave maximum once per 100ms
      delay: 100
    })
  }

  disableSending() {
    if (this.disposer) {
      this.disposer()
    }
  }

  private update(key, value) {
    if (key === 'selectedStoreId') {
      this.selectedStoreId = value
      return
    }

    try {    
      const data = JSON.parse(value)
      runInAction(() => {
        if (!graphStorage.stores[key]) {
          graphStorage.stores[key] = new Store()
        }

        const store = graphStorage.stores[key]
        store.fillWithData(data)
      })
    } catch(e) {
      // do not care about malformed storage keys
    }
  }

  private receive = e => {
    const { key, oldValue, newValue } = e
    if (key && newValue) {
      this.update(key, newValue)
    }
  }

  enableReceiving() {
    Object.entries(window.localStorage).forEach(([key, value]) => this.update(key, value))
    window.addEventListener('storage', this.receive)
  }

  disableReceiving() {
    window.removeEventListener('storage', this.receive)
  }

  setStoreId(id: string) {
    window.localStorage.setItem('selectedStoreId', id)
  }
}


export default LocalStorageSync