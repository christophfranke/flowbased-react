import { computed, observable } from 'mobx'

import * as Editor from '@editor/types'

import { Node, NodeIdentifier, Connection, Scope, Context, Module, NodeDefinition } from '@engine/types'
import { flatten, transformer, unique } from '@engine/util'
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

interface EditorGraph {
  name: string
  nodes: Editor.Node[]
  connections: Editor.Connection[]
}

class Translator {
  @observable editor: EditorGraph
  @observable name: string

  constructor(editor: EditorGraph) {
    this.name = editor.name
    this.editor = editor
  }

  @observable modules: { [key: string]: Module } = {
    Core,
    React,
    Array: ArrayModule,
    Object: ObjectModule,
    Define,
    Input,
    Javascript,
    Error: ErrorModule
  }

  @computed get export(): Module {
    return module(this.name, this.defines)
  }

  @computed get context(): Context {
    return {
      modules: this.modules,
      types: {},
      defines: this.defines
    }
  }

  @computed get scope(): Scope {
    return {
      locals: {},
      context: this.context,
      parent: null
    }
  }

  @computed get defines(): Node[] {
    return this.editor.nodes.filter(node => node.type === 'Define')
      .map(node => this.getNode(node.id))
  }

  @transformer
  getEditorNode(id: number): Editor.Node | undefined {
    return this.editor.nodes.find(node => node.id === id)
  }

  @transformer
  getInputs(editorNodeId: number): { [key: string]: Connection[] } {
    const editorNode = this.getEditorNode(editorNodeId)
    if (!editorNode) {
      return {}
    }

    const connections = this.editor.connections.filter(connection => connection.target.nodeId === editorNode.id)
    return unique(connections.map(con => con.target.key))
      .reduce((obj, key) => ({
        ...obj,
        [key]: connections.filter(con => con.target.key === key)
          .sort((a, b) => a.target.slot - b.target.slot)
          .filter(connection =>
            this.getEditorNode(connection.src.nodeId) &&
            this.getEditorNode(connection.target.nodeId))
          .map(connection => ({
            id: connection.id,
            src: {
              key: connection.src.key,
              node: this.getNode(this.getEditorNode(connection.src.nodeId)!.id)
            },
            target: {
              key: connection.target.key,
              node: this.getNode(this.getEditorNode(connection.target.nodeId)!.id)
            }
          }))
      }), {})
  }

  @transformer
  getOutputs(editorNodeId: number): { [key: string]: Connection[] } {
    const editorNode = this.getEditorNode(editorNodeId)
    if (!editorNode) {
      return {}
    }

    const connections = this.editor.connections
      .filter(connection => connection.src.nodeId === editorNode.id)
      .filter(connection =>
        this.getEditorNode(connection.src.nodeId) &&
        this.getEditorNode(connection.target.nodeId))

    return unique(connections.map(con => con.src.key))
      .reduce((obj, key) => ({
        ...obj,
        [key]: connections.filter(con => con.src.key === key)
          .sort((a, b) => a.src.slot - b.src.slot)
          .map(connection => ({
            id: connection.id,
            src: {
              key: connection.src.key,
              node: this.getNode(this.getEditorNode(connection.src.nodeId)!.id)
            },
            target: {
              key: connection.target.key,
              node: this.getNode(this.getEditorNode(connection.target.nodeId)!.id)
            }
          }))
      }), {})
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