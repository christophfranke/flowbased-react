import { computed, observable } from 'mobx'

import * as Editor from '@editor/types'

import { Node, Connection } from '@engine/types'
import { flatten, transformer } from '@shared/util'

interface EditorGraph {
  nodes: Editor.Node[]
  connections: Editor.Connection[]
}

class Translator {
  editor: EditorGraph
  constructor(editor: EditorGraph) {
    this.editor = editor
  }

  @transformer
  getConnections(connector: Editor.Connector): Editor.Connection[] {
    return this.editor.connections
      .filter(connection => connection.from === connector || connection.to === connector)
  }

  @transformer
  static connectorsOfNode(node: Editor.Node): Editor.Connector[] {
    return flatten(Object.values(node.connectors))
  }

  @transformer
  nodeOfConnector(connector: Editor.Connector): Editor.Node | undefined {
    return this.editor.nodes.find(node => Translator.connectorsOfNode(node)
      .some(con => con === connector))      
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
    const node = this.nodeOfConnector(connector)
    if (!node) {
      throw new Error('Cannot find node of connector')
    }

    return {
      id: editorConnection.id,
      node: this.getNode(node),
      key: editorConnection.to.name === 'input'
        ? ''
        : editorConnection.to.name
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
    const id = editorNode.id
    const inputs = () => this.getConnectionsOfConnectorsForInputs(editorNode.connectors.input)
    const properties = () => this.getConnectionsOfConnectorsForInputs(editorNode.connectors.properties)
    const outputs = () => this.getConnectionsOfConnectorsForOutput(editorNode.connectors.output)

    return {
      id: editorNode.id,
      name: editorNode.type,
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
}

export default Translator