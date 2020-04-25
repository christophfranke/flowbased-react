import { observable, computed, autorun, action } from 'mobx'
import { Connection, Node, Connector, ConnectorState, Module, EditorDefinition, NodeIdentifier } from '@editor/types'
import { sync, load } from '@shared/local-storage-sync'
import Translator from '@engine/translator'
import { Context } from '@engine/types'

import ConnectorFunctions from '@editor/store/connector'
import NodeFunctions from '@editor/store/node'

import { filteredSubForest } from '@engine/tree'
import { flatten, transformer } from '@engine/util'

import * as Core from '@engine/modules/core'
import * as React from '@engine/modules/react'
import * as ObjectModule from '@engine/modules/object'
import * as ArrayModule from '@engine/modules/array'
import * as Define from '@engine/modules/define'
import * as Input from '@engine/modules/input'
import * as Javascript from '@engine/modules/javascript'

class Store {
  connector: ConnectorFunctions
  node: NodeFunctions

  @observable name = ''
  @observable connections: Connection[] = []
  @observable nodes: Node[] = []
  @observable pendingConnector: Connector | null = null
  @observable selectedNodes: Node[] = []
  @observable currentHighZ = 1

  get data() {
    return {
      nodes: this.nodes,
      connections: this.connections,
      currentHighZ: this.currentHighZ
    }
  }

  modules: { [key: string]: Module } = {
    Core,
    React,
    Array: ArrayModule,
    Object: ObjectModule,
    Define,
    Input,
    Javascript
  }


  @computed get context(): Context {
    return this.translated.context
  }

  translated: Translator

  constructor() {
    this.connector = new ConnectorFunctions(this)
    this.node = new NodeFunctions(this)

    this.translated = new Translator(this)
  }

  static syncedInstance: Store
  static createFromLocalStorage(): Store {
    if (!Store.syncedInstance) {
      const store = new Store()

      store.nodes = load(['editor', 'nodes']) || []
      store.connections = load(['editor', 'connections']) || []
      store.currentHighZ = load(['editor', 'highZ']) || 1
      store.name = load(['editor', 'name']) || ''

      // autosave immediately
      sync(['editor', 'connections'], store, 'connections')
      sync(['editor', 'nodes'], store, 'nodes')
      sync(['editor', 'highZ'], store, 'currentHighZ')
      sync(['editor', 'name'], store, 'name')

      Store.syncedInstance = store
    }

    return Store.syncedInstance
  }

  static createFromData(data) {
    const store = new Store()
    store.nodes = data.nodes || []
    store.connections = data.connections || []
    store.currentHighZ = data.currentHighZ || 1
    store.name = data.name || ''

    return store
  }

  uid(): number {
    return Math.random()
  }

  @transformer
  editorDefinition(node: NodeIdentifier): EditorDefinition<string> {
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

  @action
  deleteNodes(nodes: Node[]) {
    nodes.forEach(node => {
      this.deleteNode(node)
    })
  }

  @action
  deleteNode(node: Node) {
    this.connections = this.connections
      .filter(connection =>
        this.connector.connector(connection.src) &&
        this.connector.connector(connection.src)!.group.ports.node !== node &&
        this.connector.connector(connection.target) &&
        this.connector.connector(connection.target)!.group.ports.node !== node)
    // if (this.pendingConnector && this.nodeOfConnector(this.pendingConnector) === node) {
    //   this.pendingConnector = null
    // }
    this.nodes = this.nodes.filter(other => other !== node)
  }
}

export default Store