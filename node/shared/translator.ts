import { computed, observable } from 'mobx'

import * as Editor from '@editor/types'

import { Node, Connection, Scope, Context, Module } from '@engine/types'
import { flatten, transformer, unique } from '@shared/util'

import * as Core from '@engine/modules/core'
import * as React from '@engine/modules/react'
import * as ObjectModule from '@engine/modules/object'
import * as ArrayModule from '@engine/modules/array'

interface EditorGraph {
  nodes: Editor.Node[]
  connections: Editor.Connection[]
}

class Translator {
  @observable editor: EditorGraph
  constructor(editor: EditorGraph) {
    this.editor = editor
  }

  modules = {
    Core,
    React,
    ArrayModule,
    ObjectModule
  }

  @computed
  get definitions(): Module {
    return {
      Node: {
        ...Object.values(this.modules).reduce((all, module) => ({
          ...all,
          ...module.Node
        }), {})
      },
      Type: {
        ...Object.values(this.modules).reduce((all, module) => ({
          ...all,
          ...module.Type
        }), {})
      }
    }
  }

  @computed get context(): Context {
    return {
      definitions: this.definitions
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


  getEditorNode(id: number): Editor.Node {
    const node = this.editor.nodes.find(node => node.id === id)
    if (node) {
      return node
    }

    throw new Error(`Cannot find editor node with id ${id}`)
  }

  @transformer
  getInputs(editorNode: Editor.Node): { [key: string]: Connection[] } {
    const connections = this.editor.connections.filter(connection => connection.target.nodeId === editorNode.id)
    return unique(connections.map(con => con.target.key))
      .reduce((obj, key) => ({
        ...obj,
        [key]: connections.filter(con => con.target.key === key)
          .sort((a, b) => a.target.slot - b.target.slot)
          .map(connection => ({
            id: connection.id,
            src: {
              key: connection.src.key,
              node: this.getNode(this.getEditorNode(connection.src.nodeId))
            },
            target: {
              key: connection.target.key,
              node: this.getNode(this.getEditorNode(connection.target.nodeId))
            }
          }))
      }), {})
  }

  @transformer
  getOutputs(editorNode: Editor.Node): { [key: string]: Connection[] } {
    const connections = this.editor.connections.filter(connection => connection.src.nodeId === editorNode.id)
    return unique(connections.map(con => con.src.key))
      .reduce((obj, key) => ({
        ...obj,
        [key]: connections.filter(con => con.src.key === key)
          .sort((a, b) => a.src.slot - b.src.slot)
          .map(connection => ({
            id: connection.id,
            src: {
              key: connection.src.key,
              node: this.getNode(this.getEditorNode(connection.src.nodeId))
            },
            target: {
              key: connection.target.key,
              node: this.getNode(this.getEditorNode(connection.target.nodeId))
            }
          }))
      }), {})
  }

  @transformer
  getParams(editorNode: Editor.Node): { [key: string]: any } {
    return editorNode.params.reduce((obj, param) => ({
      ...obj,
      [param.key]: param.value
    }), {})
  }

  @transformer
  getNode(editorNode: Editor.Node): Node {
    const getInputs = () => this.getInputs(editorNode)
    const getOutputs = () => this.getOutputs(editorNode)
    const getParams = () => this.getParams(editorNode)

    return {
      id: editorNode.id,
      type: editorNode.type,
      get params() {
        return getParams()
      },
      connections: {
        get input() {
          console.log('inputs', editorNode.type, editorNode.id, getInputs())
          return getInputs()
        },
        get output() {
          return getOutputs()
        }
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