import { observable, runInAction, reaction, autorun, IReactionDisposer } from 'mobx'
import graphStorage from '@service/graph-storage'
import Store from '@editor/store'

class LocalStorageSync {
  version = 0

  enableSending() {
    autorun(() => {
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

  enableReceiving() {    
    window.addEventListener('storage', (e) => {
      const { key, oldValue, newValue } = e
      if (key && newValue) {
        const msg = JSON.parse(newValue)
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
      }
    })
  }
}


export default LocalStorageSync