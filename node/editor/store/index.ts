import { observable, computed, autorun, action } from 'mobx'
import { Connection, Node, Connector, ConnectorState } from '@editor/types'
import { sync, load } from '@shared/local-storage-sync'
import Translator from '@shared/translator'

import ConnectorFunctions from '@editor/store/connector'
import NodeFunctions from '@editor/store/node'

import { flatten } from '@shared/util'

class Store {
  connector: ConnectorFunctions
  node: NodeFunctions
  @observable connections: Connection[] = []
  @observable nodes: Node[] = []
  @observable pendingConnector: Connector | null = null
  @observable selectedNodes: Node[] = []
  @observable currentId: number = 0
  @computed get connectors(): Connector[] {
    return flatten(flatten(this.nodes.map(node => Object.values(node.connectors))))
  }

  translated: Translator

  constructor() {
    this.connector = new ConnectorFunctions(this)
    this.node = new NodeFunctions(this)

    this.translated = new Translator(this)

    autorun(this.addInputConnectors)
  }

  static createFromLocalStorage(): Store {
    const store = new Store()
    store.nodes = load(['editor', 'nodes']) || []

    // the connectors map reassures that strict equality comparisions
    // work because two connections with the same id will be the same objects
    const connectorsMap = store.connectors.reduce((obj, connector) => ({
      ...obj,
      [connector.id]: connector
    }), {})

    // take the connectors from the map
    const connections = load(['editor', 'connections']) || []
    store.connections = connections.map(connection => ({
      ...connection,
      from: connectorsMap[connection.from.id],
      to: connectorsMap[connection.to.id]
    }))

    store.currentId = load(['editor', 'uid']) || 0

    // autosave immediately
    sync(['editor', 'connections'], store, 'connections')
    sync(['editor', 'nodes'], store, 'nodes')
    sync(['editor', 'uid'], store, 'currentId')

    return store
  }

  uid(): number {
    this.currentId += 1
    return this.currentId
  }

  @observable nodeMap = {}
  getNodeById(id: number): Node | undefined {
    if (!this.nodeMap[id]) {
      this.nodeMap[id] = this.nodes.find(node => node.id === id)
    }

    return this.nodeMap[id]
  }

  getChildren(node: Node): Node[] {
    return this.connections
      .filter(connection => this.nodeOfConnector(connection.to) === node)
      .filter(connection => this.nodeOfConnector(connection.from))
      .map(connection => this.nodeOfConnector(connection.from) || node)
  }

  getSubtree(node: Node): Node[] {
    const visited = {
      [node.id]: true
    }
    const result = [node]

    const childrenOfNode = (current: Node): Node[] => {    
      const children = this.getChildren(current).filter(child => !visited[child.id])
      return [current].concat(flatten(children.map(child => {
        visited[child.id] = true
        return childrenOfNode(child)
      })))
    }

    return childrenOfNode(node)
  }

  @observable nodeOfConnectorMap = {}
  nodeOfConnector(connector: Connector): Node | undefined {
    if (!this.nodeOfConnectorMap[connector.id]) {
      this.nodeOfConnectorMap[connector.id] = this.nodes.find(node => this.connectorsOfNode(node)
        .some(con => con === connector))      
    }
    
    return this.nodeOfConnectorMap[connector.id]
  }

  connectorsOfNode(node: Node): Connector[] {
    return flatten(Object.values(node.connectors))
  }

  deleteNodes(nodes: Node[]) {
    nodes.forEach(node => {
      this.deleteNode(node)
    })
  }

  deleteNode(node: Node) {
    const connectors = this.connectorsOfNode(node)
    this.connections = this.connections
      .filter(connection => !connectors.includes(connection.from) && !connectors.includes(connection.to))
    this.nodes = this.nodes.filter(other => other !== node)
  }

  @computed get nodesWithDuplicateSetting(): Node[] {
    return this.nodes.filter(node =>
      node.connectors.input.length > 0
      && node.connectors.input[0].mode === 'duplicate')
  }


  addInputConnectors = () => {
    this.nodesWithDuplicateSetting
      .filter(node => node.connectors.input.every(connector => this.connector.countConnections(connector) > 0))
      .forEach(node => {        
        node.connectors.input.push(this.connector.cloneConnector(node.connectors.input[0]))
      })
  }
}

export default Store