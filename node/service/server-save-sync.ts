import { observable, reaction, IReactionDisposer } from 'mobx'
import graphStorage from '@service/graph-storage'
import Store from '@editor/store'

class ServerSync {
  disposer: IReactionDisposer

  enableSaving() {
    this.disposer = reaction(() => {
      return Object.values(graphStorage.stores).map(store => store.version)
    },
    () => {
      console.log('should save to server now')
    }, {
      // autosave once per minute
      delay: 60000
    })
  }

  disableSending() {
    if (this.disposer) {
      this.disposer()
    }
  }
}


export default ServerSync