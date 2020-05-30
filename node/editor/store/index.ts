import { observable, computed, autorun, action, reaction, runInAction } from 'mobx'
import { Connection, Node, Connector, ConnectorState, Module, EditorDefinition, NodeIdentifier } from '@editor/types'
import Translator from '@engine/translator'
import { Context } from '@engine/types'

import ConnectorFunctions from '@editor/store/connector'
import NodeFunctions from '@editor/store/node'
import { module } from '@editor/store/module'

import { filteredSubForest } from '@engine/tree'
import { flatten, transformer } from '@engine/util'

import graphStorage from '@service/graph-storage'


class Store {
  connector: ConnectorFunctions
  node: NodeFunctions

  @observable nodeMap: { [id: number]: Node } = {}
  @observable connectionMap: { [id: number]: Connection } = {}

  @computed get nodes(): Node[] {
    return Object.values(this.nodeMap)
  }

  @computed get connections(): Connection[] {
    return Object.values(this.connectionMap)
  }

  @observable defines: Node[] = []

  @observable name = ''
  @observable pendingConnector: Connector | null = null
  @observable selectedNodes: Node[] = []
  @observable currentHighZ = 1
  @observable version = -1

  get data() {
    return {
      nodes: this.nodes,
      connections: this.connections,
      currentHighZ: this.currentHighZ,
      name: this.name,
      version: this.version
    }
  }

  @computed get modules(): { [key: string]: Module } {
    return graphStorage.editorModules
  }

  @computed get context(): Context {
    return graphStorage.context
  }

  translated: Translator

  constructor() {
    this.connector = new ConnectorFunctions(this)
    this.node = new NodeFunctions(this)

    this.translated = new Translator(this)

    // bump version on changes
    reaction(() => {
      return {
        nodes: this.nodes.map(node => ({
          ...node,
          params: node.params.map(param => ({
            ...param
          }))
        })),
        connections: this.connections.map(connection => ({
          ...connection
        })),
        currentHighZ: this.currentHighZ,
        name: this.name
      }
    },
    () => {
      this.version += 1
      // console.log('new version', this.version)
    }, {
      delay: 50
    })
  }

  static createFromData(data) {
    const store = new Store()
    store.fillWithData(data)

    return store
  }

  fillWithData(data) {
    runInAction(() => {    
      if (data.version > this.version) {
        // console.log('filled with data', data.name, data.version)
        const nodeIds = {}
        const dataNodes = data.nodes || []
        dataNodes.forEach(dataNode => {
          if (!this.nodeMap[dataNode.id]) {
            this.addNode(dataNode)
          } else {
            this.updateNode(dataNode)
          }
          nodeIds[dataNode.id] = true
        })
        Object.keys(this.nodeMap).forEach(id => {
          if (!nodeIds[id]) {
            delete this.nodeMap[id]
          }
        })

        const connectionIds = {}
        const dataConnections = data.connections || []
        dataConnections.forEach(dataConnection => {
          if (!this.connectionMap[dataConnection.id]) {
            this.addConnection(dataConnection)
          } else {
            this.updateConnection(dataConnection)
          }
          connectionIds[dataConnection.id] = true
        })
        Object.keys(this.connectionMap).forEach(id => {
          if (!connectionIds[id]) {
            delete this.connectionMap[id]
          }
        })

        this.currentHighZ = data.currentHighZ || 1
        this.name = data.name || ''   
        this.version = data.version - 1 || -1
      }
    })
  }

  uid(): number {
    return Math.random()
  }

  @transformer
  connectionsOfNode(id: number): Connection[] {
    return this.connections.filter(con =>
      con.src.nodeId === id || con.target.nodeId === id)
  }

  @action
  copyNode(oldNode: Node): Node {
    const newNode = this.node.createNode(oldNode.position, oldNode.module, oldNode.type)
    newNode.params.forEach((newParam, index) => {
      const originalParam = oldNode.params.find(oldParam => oldParam.key === newParam.key)
      if (originalParam) {
        newNode.params[index].value = originalParam.value
      }
    })

    return newNode
  }

  @action
  copyConnection(connection: Connection, srcId: number, targetId: number) {
    const newConnection: Connection = observable({
      id: this.uid(),
      src: {
        ...connection.src
      },
      target: {
        ...connection.target
      }
    })

    newConnection.src.nodeId = srcId
    newConnection.target.nodeId = targetId

    this.addConnection(newConnection)
    return newConnection
  }

  @transformer
  editorDefinition(node: NodeIdentifier): EditorDefinition<string> {
    if (!this.modules[node.module]) {
      console.warn('cannot find module', node.module, 'in', this.modules)
      return this.modules.Error.EditorNode.ModuleNotFound
    }
    if (!this.modules[node.module].EditorNode[node.type]) {
      return this.modules.Error.EditorNode.NodeNotFound
    }

    return this.modules[node.module].EditorNode[node.type]
  }

  @transformer
  getNodeById(id: number): Node | undefined {
    return this.nodes.find(node => node.id === id)
  }

  @transformer
  getChildren(node: Node): Node[] {
    return this.connections
      .filter(connection => this.connector.connector(connection.target))
      .filter(connection => this.connector.connector(connection.target)!.group.ports.node === node)
      .map(connection => this.connector.connector(connection.src)!.group.ports.node)
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

  @action selectNodes(nodes: Node[]) {
    if (nodes.length > 0 && !nodes.every(node => this.selectedNodes.includes(node))) {
      this.currentHighZ += 1
      nodes.forEach(node => {
        node.zIndex = this.currentHighZ
      })
    }

    this.selectedNodes = nodes
  }

  @action addConnection(connection: Connection) {
    this.connectionMap[connection.id] = connection
  }

  @action updateConnection(newConnection: Connection) {
    const oldConnection = this.connectionMap[newConnection.id]
    Object.keys(newConnection).forEach(key => {
      if (oldConnection[key] !== newConnection[key]) {
        oldConnection[key] = newConnection[key]
      }
    })
  }

  @action deleteConnection(connection: Connection) {
    delete this.connectionMap[connection.id]
  }

  @action
  deleteNodes(nodes: Node[]) {
    nodes.forEach(node => {
      this.deleteNode(node)
    })
  }

  @action
  deleteNode(node: Node, withConnections = true) {
    if (withConnections) {    
      this.connectionsOfNode(node.id)
        .forEach(connection => this.deleteConnection(connection))
    }
    // TODO: Fix this
    // if (this.pendingConnector && this.nodeOfConnector(this.pendingConnector) === node) {
    //   this.pendingConnector = null
    // }
    if (node.type === 'Define') {
      this.defines = this.defines.filter(other => other !== node)
    }
    delete this.nodeMap[node.id]
  }

  @action
  addNode(node: Node) {
    this.nodeMap[node.id] = node
    if (node.type === 'Define') {
      this.defines.push(node)
    }
  }

  @action
  updateNode(newNode: Node) {
    const oldNode = this.nodeMap[newNode.id]
    Object.keys(newNode).forEach(key => {
      if (oldNode[key] !== newNode[key]) {
        oldNode[key] = newNode[key]
      }
    })
  }
}

export default Store