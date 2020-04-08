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
  getConnection(editorConnection: Editor.Connection): Connection {
    const id = editorConnection.id
    const node = this.nodeOfConnector(editorConnection.from)
    if (!node) {
      throw new Error('Cannot find node of connector')
    }

    return {
      id: editorConnection.id,
      node: this.getNode(node),
      key: editorConnection.to.name
    }
  }

  @transformer
  getConnectionsOfConnectors(connectorGroup: Editor.Connector[]): Connection[] {
    const result = flatten(connectorGroup.map(connector => this.getConnections(connector)))
      .map(editorConnection => this.getConnection(editorConnection))

    return result
  }

  @transformer
  getNode(editorNode: Editor.Node): Node {
    const id = editorNode.id
    const inputs = () => this.getConnectionsOfConnectors(editorNode.connectors.input)
    const outputs = () => this.getConnectionsOfConnectors(editorNode.connectors.output)
    const properties = () => this.getConnectionsOfConnectors(editorNode.connectors.properties)

    return {
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
}

export default Translator