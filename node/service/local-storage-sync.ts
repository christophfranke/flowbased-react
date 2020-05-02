import { observable, runInAction, autorun, IReactionDisposer } from 'mobx'
import graphStorage from '@service/graph-storage'
import Store from '@editor/store'

class LocalStorageSync {
  @observable selectedStoreId: string | null = null
  disposer: IReactionDisposer
  version = 0

  enableSending() {
    this.disposer = autorun(() => {
      this.version += 1
      // console.log('sending', this.version)
      Object.entries(graphStorage.stores).forEach(([id, store]) => {
        window.localStorage.setItem(id, JSON.stringify({
          data: store.data,
          version: this.version
        }))
      })
    }, {
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
      const msg = JSON.parse(value)
      if (msg.version > this.version) {
        // console.log('receiving', msg.version)
        this.version = msg.version - 2 // for some reason this triggers two autoruns

        runInAction(() => {
          if (!graphStorage.stores[key]) {
            graphStorage.stores[key] = new Store()
          }

          const store = graphStorage.stores[key]
          const data = msg.data

          store.fillWithData(data)
        })
      }
    } catch(e) {
      // anything can happen
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