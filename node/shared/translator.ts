import { computed, observable } from 'mobx'

import * as Editor from '@editor/types'

import { Node, NodeIdentifier, Connection, Scope, Context, Module, NodeDefinition } from '@engine/types'
import { flatten, transformer, unique } from '@shared/util'
import { filteredSubForest } from '@engine/tree'
import { type } from '@engine/render'

import * as Core from '@engine/modules/core'
import * as React from '@engine/modules/react'
import * as ObjectModule from '@engine/modules/object'
import * as ArrayModule from '@engine/modules/array'
import * as Define from '@engine/modules/define'

interface EditorGraph {
  nodes: Editor.Node[]
  connections: Editor.Connection[]
}

class Translator {
  @observable editor: EditorGraph
  constructor(editor: EditorGraph) {
    this.editor = editor
  }

  @computed get modules(): { [key: string]: Module } {
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
          Node: self.localNodes,
          Type: self.localTypes,
        } as Module
      }
    }
  }

  @computed get localNodes() {
    const result = this.context.defines.reduce((obj, define) => ({
      ...obj,
      [`define-${define.id}`]: {
        value: (node: Node, scope: Scope) => {
          return scope.context.modules.Define.Node.Proxy.value(node, scope, 'output')
        },
        type: {
          output: {
            output: (node: Node, context: Context) => {
              return context.modules.Define.Node.Proxy.type.output!.output!(node, context)
            }
          },
          get input() {
            const forest = filteredSubForest(define, candidate => candidate.type === 'Input')

            return forest.reduce((obj, input) => ({
              ...obj,
              [input.node.params.name]: (node: Node, context: Context) => {
                const newContext = {
                  ...context,
                  types: {
                    ...context.types,
                    [define.id]: type(node, context)
                  }
                }

                return type(input.node, newContext)
              }
            }), {})
          }
        }
      }
    }), {})

    return result
  }

  @transformer
  nodeDefinition(node: NodeIdentifier): NodeDefinition {
    return this.modules[node.module].Node[node.type]
  }

  @computed get localTypes() {
    return {}
  }

  @computed get context(): Context {
    return {
      modules: this.modules,
      types: {},
      defines: this.defines
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
    return this.editor.nodes.filter(node => node.type === 'Define')
      .map(node => this.getNode(node))
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
      module: editorNode.module,
      get params() {
        return getParams()
      },
      connections: {
        get input() {
          return getInputs()
        },
        get output() {
          return getOutputs()
        }
      }
    }
  }
}

export default Translator