import { observable, computed } from 'mobx'
import { Node, Connection, Connector } from '@editor/types'
import { flatten } from '@shared/util'
import { load } from '@shared/local-storage-sync'

export default class StorageEditor {
  @observable nodes: Node[]
  @observable connections: Connection[]

  constructor() {
    this.load()
    window.addEventListener('storage', this.load)
  }

  load = () => {
    this.nodes = load(['editor', 'nodes']) || []
    this.connections = load(['editor', 'connections']) || []
  }
}
