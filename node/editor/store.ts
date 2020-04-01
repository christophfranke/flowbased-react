import { observable, computed, autorun } from 'mobx'
import { Connection, Node, Connector } from '@editor/types'
import { cloneConnector, countConnections } from '@editor/connector'
import { sync, load } from '@editor/local-storage-sync'

import { flatten } from '@editor/util'

class Store {
  @observable connections: Connection[] = []
  @observable nodes: Node[] = []
  @observable pendingConnector: Connector | null = null
  @observable currentId: number = 0
  @computed get connectors(): Connector[] {
    return flatten(flatten(this.nodes.map(node => Object.values(node.connectors))))
  }

  initialize() {
    this.nodes = load(['editor', 'nodes'])

    // the connectors map reassures that strict equality comparisions
    // work because two connections with the same id will be the same objects
    const connectorsMap = this.connectors.reduce((obj, connector) => ({
      ...obj,
      [connector.id]: connector
    }), {})

    // take the connectors from the map
    const connections = load(['editor', 'connections'])
    this.connections = connections.map(connection => ({
      ...connection,
      from: connectorsMap[connection.from.id],
      to: connectorsMap[connection.to.id]
    }))

    this.currentId = load(['editor', 'uid']) || 0

    // autosave immediately
    sync(['editor', 'connections'], this, 'connections')
    sync(['editor', 'nodes'], this, 'nodes')
    sync(['editor', 'uid'], this, 'currentId')
  }

  uid(): number {
    this.currentId += 1
    return this.currentId
  }

  nodeOfConnector(connector: Connector): Node | undefined {
    return this.nodes.find(node => this.connectorsOfNode(node)
      .some(con => con === connector))
  }

  connectorsOfNode(node: Node): Connector[] {
    return flatten(Object.values(node.connectors))
  }

  deleteNode(node: Node) {
    const connectors = this.connectorsOfNode(node)
    this.connections = this.connections
      .filter(connection => !connectors.includes(connection.from) && !connectors.includes(connection.to))
    this.nodes = this.nodes.filter(other => other !== node)
  }

  // removeInputConnectors = () => {
  //   this.nodes.forEach(node => {
  //     const emptyConnectors = node.connectors.input.filter(connector => connector.connections === 0)
  //     if (emptyConnectors.length > 1) {
  //       node.connectors.input = node.connectors.input
  //         .filter(connector => connector === emptyConnectors[0] || connector.connections > 0)
  //     }
  //   })    
  // }

  addInputConnectors = () => {
    this.nodes
      .filter(node => node.connectors.input.length > 0)
      .filter(node => node.connectors.input.every(connector => countConnections(connector) > 0))
      .forEach(node => {        
        node.connectors.input.push(cloneConnector(node.connectors.input[0]))
      })
  }
}

const store = new Store()

autorun(store.addInputConnectors)
// autorun(store.removeInputConnectors)

export default store