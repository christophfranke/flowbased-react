import { computed, observable } from 'mobx'

import * as Editor from '@editor/types'
import { Node, Connection } from '@engine/types'
import { flatten } from '@editor/util'

import store from '@editor/store'
import { getConnections } from '@editor/connector'

interface NodeMap {
  [id: number]: Node
}

interface ConnectionMap {
  [id: number]: Connection
}

class Store {
  @computed get preview(): Editor.Node | undefined {
    return store.nodes.find(node => node.type === 'Preview')
  }

  @computed get tree(): Node | undefined {
    return this.preview && this.getNode(this.preview)
  }

  @observable connections: ConnectionMap = {}
  getConnection(editorConnection: Editor.Connection): Connection {
    const id = editorConnection.id
    if (!this.connections[id]) {
      const node = store.nodeOfConnector(editorConnection.from)
      if (!node) {
        throw new Error('Cannot find node of connector')
      }

      this.connections[id] = {
        id: editorConnection.id,
        node: this.getNode(node),
        type: editorConnection.from.type
      }
    }

    return this.connections[id]
  }

  getConnectionsOfConnectors(connectorGroup: Editor.Connector[]): Connection[] {
    const result = flatten(connectorGroup.map(connector => getConnections(connector)))
      .map(editorConnection => this.getConnection(editorConnection))

    return result
  }

  @observable nodes: NodeMap = {}
  getNode(editorNode: Editor.Node): Node {
    const id = editorNode.id
    if (!this.nodes[id]) {
      const inputs = () => this.getConnectionsOfConnectors(editorNode.connectors.input)
      const outputs = () => this.getConnectionsOfConnectors(editorNode.connectors.output)
      const properties = () => this.getConnectionsOfConnectors(editorNode.connectors.properties)

      this.nodes[id] = {
        id: editorNode.id,
        type: editorNode.type,
        get params() {
          return editorNode.params.reduce((obj, {key, value}) => ({
            ...obj,
            [key]: value
          }), {})
        },
        connections: {
          get input() {
            return inputs()
          },
          get output() {
            return outputs()
          },
          get properties() {
            return properties()
          },
        }
      }
    }

    return this.nodes[id]
  }
}

export default new Store()