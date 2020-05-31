import { computed, observable } from 'mobx'

import * as Editor from '@editor/types'
import Store from '@editor/store'

import { Node, NodeIdentifier, Connection, Scope, Context, Module, NodeDefinition } from '@engine/types'
import { flatten, transformer, unique, computedFunction } from '@engine/util'
import { filteredSubForest } from '@engine/tree'
import { intersectAll } from '@engine/type-functions'
import { module } from '@engine/module'

import * as Core from '@engine/modules/core'
import * as React from '@engine/modules/react'
import * as ObjectModule from '@engine/modules/object'
import * as ArrayModule from '@engine/modules/array'
import * as Define from '@engine/modules/define'
import * as Input from '@engine/modules/input'
import * as Javascript from '@engine/modules/javascript'
import * as ErrorModule from '@engine/modules/error'

class Translator {
  @observable editor: Store
  @observable name: string

  constructor(editor: Store) {
    this.name = editor.name
    this.editor = editor
  }


  @computed get export(): Module {
    return module(this.name, this.defines)
  }

  @computed get defines(): Node[] {
    return this.editor.defines.map(node => this.getNode(node.id))
  }

  @transformer
  getEditorNode(id: number): Editor.Node | undefined {
    return this.editor.nodeMap.getItem(id)
  }

  @transformer
  getInputs(editorNodeId: number): { [key: string]: Connection[] } {
    const editorNode = this.getEditorNode(editorNodeId)
    if (!editorNode) {
      return {}
    }

    const connections = this.editor.connectionsOfNode(editorNodeId)
      .filter(connection => connection.target.nodeId === editorNode.id)
    const getNode = id => this.getNode(id)

    const keys = unique(connections.map(con => con.target.key))
    const result = {}
    keys.forEach(key => {
      const connectionsOfKey = connections.filter(con => con.target.key === key)
      Object.defineProperty(result, key, {
        get: computedFunction(function() {
          return connectionsOfKey
            .sort((a, b) => a.target.slot - b.target.slot)
            .map(connection => ({
              id: connection.id,
              src: {
                key: connection.src.key,
                get node() {
                  return getNode(connection.src.nodeId)
                }
              },
              target: {
                key: connection.target.key,
                get node() {
                  return getNode(connection.target.nodeId)
                }
              }
            }))
          }),
        enumerable: true
      })
    })

    return result
  }

  @transformer
  getOutputs(editorNodeId: number): { [key: string]: Connection[] } {
    const editorNode = this.getEditorNode(editorNodeId)
    if (!editorNode) {
      return {}
    }

    const connections = this.editor.connectionsOfNode(editorNodeId)
      .filter(connection => connection.src.nodeId === editorNode.id)
    const getNode = id => this.getNode(id)

    const keys = unique(connections.map(con => con.src.key))
    const result = {}
    keys.forEach(key => {
      const connectionsOfKey = connections.filter(con => con.src.key === key)
      Object.defineProperty(result, key, {
        get: computedFunction(function() {
          return connectionsOfKey
            .sort((a, b) => a.target.slot - b.target.slot)
            .map(connection => ({
              id: connection.id,
              src: {
                key: connection.src.key,
                get node() {
                  return getNode(connection.src.nodeId)
                }
              },
              target: {
                key: connection.target.key,
                get node() {
                  return getNode(connection.target.nodeId)
                }
              }
            }))
          }),
        enumerable: true
      })
    })

    return result
  }

  @transformer
  getParams(editorNodeId: number): { [key: string]: any } {
    const editorNode = this.getEditorNode(editorNodeId)
    return editorNode
      ? editorNode.params.reduce((obj, param) => ({
          ...obj,
          [param.key]: param.value
        }), {})
      : {}
  }

  @transformer
  getNode(editorNodeId: number): Node {
    const editorNode = this.getEditorNode(editorNodeId)
    if (!editorNode) {
      return {
        id: editorNodeId,
        type: 'NodeNotFound',
        module: 'Error',
        params: {},
        connections: {
          input: {},
          output: {}
        }
      }
    }

    const getInputs = () => this.getInputs(editorNode.id)
    const getOutputs = () => this.getOutputs(editorNode.id)
    const getParams = () => this.getParams(editorNode.id)

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