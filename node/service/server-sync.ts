import { observable, reaction, IReactionDisposer } from 'mobx'
import graphStorage from '@service/graph-storage'
import Store from '@editor/store'

class ServerSync {
  disposer: IReactionDisposer

  enableSaving() {
    console.log('enabled saving')
    this.disposer = reaction(() => {
      return Object.values(graphStorage.stores).map(store => store.version)
    },
    () => {
      return Promise.all(Object.entries(graphStorage.stores).map(([id, store]) => {
        console.log('saving', store.name, store.version)
        return fetch(`/api/documents/${id}`, {
          method: 'POST',
          body: JSON.stringify(store.data)
        })
      }))
    }, {
      // autosave once per second
      delay: 1000
    })
  }

  disableSaving() {
    if (this.disposer) {
      this.disposer()
    }
  }
}


export default ServerSync