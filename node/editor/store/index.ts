import { observable, computed, autorun, action } from 'mobx'
import { Connection, Node, Connector, ConnectorState } from '@editor/types'
import { sync, load } from '@shared/local-storage-sync'
import { setStaticGlobalScope } from '@engine/scopes'
import Translator from '@shared/translator'

import ConnectorFunctions from '@editor/store/connector'
import NodeFunctions from '@editor/store/node'

import { flatten, transformer } from '@shared/util'

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
    setStaticGlobalScope(this.translated.scope)

    autorun(this.addInputConnectors)
    autorun(this.removeDuplicatePreviews)
  }

  static syncedInstance: Store
  static createFromLocalStorage(): Store {
    if (!Store.syncedInstance) {
      const store = new Store()
      store.nodes = load(['editor', 'nodes'],
        nodes => nodes.map(node => node.type === 'Proxy'
          ? {
            ...node,
            get name() {
              const define = store.nodes.find(other => other.id === Number(store.node.getParamValue(node, 'define')))
              return define
                ? store.node.getParamValue(define, 'name') || 'Unnamed'
                : 'Undefined'
            }
          }
          : node)
      ) || []

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
      sync(['editor', 'nodes'], store, 'nodes',
        nodes => nodes.map(node => node.type === 'Proxy'
          ? {
            ...node,
            name: node.name
          }
          : node
        )
      )
      sync(['editor', 'uid'], store, 'currentId')

      Store.syncedInstance = store
    }

    return Store.syncedInstance
  }

  uid(): number {
    this.currentId += 1
    return this.currentId
  }

  @transformer
  getNodeById(id: number): Node | undefined {
    return this.nodes.find(node => node.id === id)
  }

  @transformer
  getChildren(node: Node): Node[] {
    return this.connections
      .filter(connection => this.nodeOfConnector(connection.to) === node)
      .filter(connection => this.nodeOfConnector(connection.from))
      .map(connection => this.nodeOfConnector(connection.from) || node)
  }

  @transformer
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

  @transformer
  nodeOfConnector(connector: Connector): Node | undefined {
    return this.nodes.find(node => this.connectorsOfNode(node)
      .some(con => con === connector))      
  }

  @transformer
  connectorsOfNode(node: Node): Connector[] {
    return flatten(Object.values(node.connectors))
  }

  @action
  deleteNodes(nodes: Node[]) {
    nodes.forEach(node => {
      this.deleteNode(node)
    })
  }

  @action
  deleteNode(node: Node) {
    const connectors = this.connectorsOfNode(node)
    this.connections = this.connections
      .filter(connection => !connectors.includes(connection.from) && !connectors.includes(connection.to))
    if (this.pendingConnector && this.nodeOfConnector(this.pendingConnector) === node) {
      this.pendingConnector = null
    }
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

  removeDuplicatePreviews = () => {
    const previews = this.nodes.filter(node => node.type === 'Preview')
    if (previews.length > 1) {
      previews.reverse().forEach((preview, index) => {
        if (index > 0) {
          this.deleteNode(preview)
        }
      })
    }
  }
}

export default Store