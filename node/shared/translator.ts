import { computed, observable } from 'mobx'

import * as Editor from '@editor/types'

import { Node, Connection, Scope, Context } from '@engine/types'
import { flatten, transformer } from '@shared/util'

import * as Core from '@engine/modules/core'

interface EditorGraph {
  nodes: Editor.Node[]
  connections: Editor.Connection[]
}

class Translator {
  @observable editor: EditorGraph
  constructor(editor: EditorGraph) {
    this.editor = editor
  }

  @computed get context(): Context {
    return {
      definitions: {
        Node: {
          ...Core.Node
        },
        Type: {
          ...Core.Type
        }
      }
    }
  }

  @computed get scope(): Scope {
    // const defines = () => this.editor.nodes.filter(node => node.type === 'Define')
    //   .map(node => this.getNode(node))

    return {    
      locals: {},
      context: this.context,
      parent: null
    }
  }

  @computed get defines(): Node[] {
    // console.log('nodes', this.editor.nodes)
    // console.log('defines', this.editor.nodes.filter(node => node.type === 'Define'))
    // return this.editor.nodes.filter(node => node.type === 'Define')
    //   .map(node => this.getNode(node))
    return []
  }

  @transformer
  getConnections(connector: Editor.Connector): Editor.Connection[] {
    // return this.editor.connections
    //   .filter(connection => connection.from.id === connector.id || connection.to.id === connector.id)
    return []
  }

  @transformer
  static connectorsOfNode(node: Editor.Node): Editor.Connector[] {
    return []
    // return flatten(Object.values(node.connectors))
  }

  @transformer
  getConnectionFrom(editorConnection: Editor.Connection) {
    return this.getConnection(editorConnection, 'from')
  }
  @transformer
  getConnectionTo(editorConnection: Editor.Connection) {
    return this.getConnection(editorConnection, 'to')
  }

  private getConnection(editorConnection: Editor.Connection, otherKey: 'from' | 'to'): Connection {
    const id = editorConnection.id
    const connector = editorConnection[otherKey]

    return {
      id: editorConnection.id,
      src: {
        node: this.getNode(editorConnection.from.group.ports.node),
        key: editorConnection.from.group.key
      },
      target: {
        node: this.getNode(editorConnection.to.group.ports.node),
        key: editorConnection.to.group.key
      }
    }
  }

  @transformer
  getConnectionsOfConnectorsForInputs(connectorGroup: Editor.Connector[]): Connection[] {
    return this.getConnectionsOfConnectors(connectorGroup, 'from')
  }
  @transformer
  getConnectionsOfConnectorsForOutput(connectorGroup: Editor.Connector[]): Connection[] {
    return this.getConnectionsOfConnectors(connectorGroup, 'to')
  }

  private getConnectionsOfConnectors(connectorGroup: Editor.Connector[], otherKey: 'from' | 'to'): Connection[] {
    return flatten(connectorGroup.map(connector => this.getConnections(connector)))
      .map(editorConnection => otherKey === 'from'
        ? this.getConnectionFrom(editorConnection)
        : this.getConnectionTo(editorConnection))
  }

  @transformer
  getNode(editorNode: Editor.Node): Node {
    return {
      id: 1,
      name: 'Hi',
      params: {},
      connections: {
        input: [],
        output: []
      }
    }
    // const id = editorNode.id
    // const inputs = () => this.getConnectionsOfConnectorsForInputs(editorNode.connectors.input)
    // const properties = () => this.getConnectionsOfConnectorsForInputs(editorNode.connectors.properties)
    // const outputs = () => this.getConnectionsOfConnectorsForOutput(editorNode.connectors.output)

    // return {
    //   id: editorNode.id,
    //   name: editorNode.type,
    //   get params() {
    //     return editorNode.params.reduce((obj, { key, value }) => ({
    //       ...obj,
    //       [key]: value
    //     }), {})
    //   },
    //   connections: {
    //     get input() {
    //       return inputs()
    //     },
    //     get output() {
    //       return outputs()
    //     },
    //     get properties() {
    //       return properties()
    //     },
    //   }
    // }
  }
}

export default Translator