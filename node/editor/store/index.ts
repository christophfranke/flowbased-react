import { observable, computed, autorun, action } from 'mobx'
import { Connection, Node, Connector, ConnectorState, Module, NodeDefinition } from '@editor/types'
import { sync, load } from '@shared/local-storage-sync'
import Translator from '@shared/translator'
import { Context } from '@engine/types'

import ConnectorFunctions from '@editor/store/connector'
import NodeFunctions from '@editor/store/node'

import { flatten, transformer } from '@shared/util'

import * as Core from '@engine/modules/core'
import * as React from '@engine/modules/react'
import * as ObjectModule from '@engine/modules/object'
import * as ArrayModule from '@engine/modules/array'
import * as Define from '@engine/modules/define'

class Store {
  connector: ConnectorFunctions
  node: NodeFunctions

  @observable connections: Connection[] = []
  @observable nodes: Node[] = []
  @observable pendingConnector: Connector | null = null
  @observable selectedNodes: Node[] = []
  @observable currentId = 0
  @observable currentHighZ = 1

  @computed get modules() {
    // old school bind this to self
    const self = this

    return {
      Core,
      React,
      Array: ArrayModule,
      Object: ObjectModule,
      Define,
      get Local() {
        return {
          Node: self.translated.context.modules.Local.Node,
          Type: self.translated.context.modules.Local.Type,
          EditorNode: self.localEditorNodes
        } as Module
      }
    }
  }

  @computed get localEditorNodes(): { [key: string]: NodeDefinition } {
    return this.context.defines.reduce((obj, define) => {
      return {
        ...obj,
        [`define-${define.id}`]: {
          type: 'Local',
          documentation: {
            explanation: 'Locally defined node'
          },
          create: () => ({
            get name() {
              return define.params.name
            },
            type: `define-${define.id}`,
            params: [{
              name: 'Define',
              key: 'define',
              value: define.id,
              type: 'hidden'
            }]
          })
        }
      }
    }, {})
  }


  @computed get context(): Context {
    return this.translated.context
  }

  translated: Translator

  constructor() {
    this.connector = new ConnectorFunctions(this)
    this.node = new NodeFunctions(this)

    this.translated = new Translator(this)

    autorun(this.addInputConnectors)
    autorun(this.removeDuplicatePreviews)
  }

  static syncedInstance: Store
  static createFromLocalStorage(): Store {
    if (!Store.syncedInstance) {
      const store = new Store()
      store.nodes = load(['editor', 'nodes']) || []

      // the connectors map reassures that strict equality comparisions
      // work because two connections with the same id will be the same objects
      // const connectorsMap = store.connectors.reduce((obj, connector) => ({
      //   ...obj,
      //   [connector.id]: connector
      // }), {})

      // take the connectors from the map
      store.connections = load(['editor', 'connections']) || []
      // store.connections = connections.map(connection => ({
      //   ...connection,
      //   from: connectorsMap[connection.from.id],
      //   to: connectorsMap[connection.to.id]
      // }))

      store.currentId = load(['editor', 'uid']) || 0
      store.currentHighZ = load(['editor', 'highZ']) || 1

      // autosave immediately
      sync(['editor', 'connections'], store, 'connections')
      sync(['editor', 'nodes'], store, 'nodes')
      sync(['editor', 'uid'], store, 'currentId')
      sync(['editor', 'highZ'], store, 'currentHighZ')

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

  @computed get nodesWithDuplicateSetting(): Node[] {
    return []
    // return this.nodes.filter(node =>
    //   node.connectors.input.length > 0
    //   && node.connectors.input[0].mode === 'duplicate')
  }

  addInputConnectors = () => {
    // this.nodesWithDuplicateSetting
    //   .filter(node => node.connectors.input.every(connector => this.connector.countConnections(connector) > 0))
    //   .forEach(node => {        
    //     node.connectors.input.push(this.connector.cloneConnector(node.connectors.input[0]))
    //   })
  }

  removeDuplicatePreviews = () => {
    // const previews = this.nodes.filter(node => node.type === 'Preview')
    // if (previews.length > 1) {
    //   previews.reverse().forEach((preview, index) => {
    //     if (index > 0) {
    //       this.deleteNode(preview)
    //     }
    //   })
    // }
  }
}

export default Store