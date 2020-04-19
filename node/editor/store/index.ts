import { observable, computed, autorun, action } from 'mobx'
import { Connection, Node, Connector, ConnectorState, Module, NodeDefinition } from '@editor/types'
import { sync, load } from '@shared/local-storage-sync'
import Translator from '@shared/translator'
import { Context } from '@engine/types'

import ConnectorFunctions from '@editor/store/connector'
import NodeFunctions from '@editor/store/node'

import { filteredSubForest } from '@engine/tree'
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
          get name() {
            return define.params.name.trim() || 'Anonymous'
          },
          type: 'Local',
          documentation: {
            explanation: 'Locally defined node'
          },
          ports: {
            get input() {
              const forest = filteredSubForest(define, candidate => candidate.type === 'Input')
              return forest.reduce((obj, input) => ({
                ...obj,
                [input.node.params.name]: input.node.params.side ? 'side' : 'main'
              }), {})
            }
          },
          create: () => ({
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
  }

  static syncedInstance: Store
  static createFromLocalStorage(): Store {
    if (!Store.syncedInstance) {
      const store = new Store()

      store.nodes = load(['editor', 'nodes']) || []
      store.connections = load(['editor', 'connections']) || []
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
  nodeDefinition(node: Node): NodeDefinition<string> {
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