import { observable, computed } from 'mobx'
import { Node, Connection, Connector } from '@editor/types'
import { flatten } from '@shared/util'
import { load } from '@shared/local-storage-sync'

export default class StorageEditor {
  @observable nodes: Node[]
  @observable connections: Connection[]
  @computed get connectors(): Connector[] {
    return flatten(flatten(this.nodes.map(node => Object.values(node.connectors))))
  }

  constructor() {
    this.load()
    window.addEventListener('storage', this.load)
  }

  load = () => {
    this.nodes = load(['editor', 'nodes']) || []

    // the connectors map reassures that strict equality comparisions
    // work because two connections with the same id will be the same objects
    const connectorsMap = this.connectors.reduce((obj, connector) => ({
      ...obj,
      [connector.id]: connector
    }), {})

    // take the connectors from the map
    const connections = load(['editor', 'connections']) || []
    this.connections = connections.map(connection => ({
      ...connection,
      from: connectorsMap[connection.from.id],
      to: connectorsMap[connection.to.id]
    }))
  }
}
