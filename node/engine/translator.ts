import { computed, observable } from 'mobx'

import * as Editor from '@editor/types'

import { Node, NodeIdentifier, Connection, Scope, Context, Module, NodeDefinition } from '@engine/types'
import { flatten, transformer, unique } from '@engine/util'
import { filteredSubForest } from '@engine/tree'
import { type, unmatchedType } from '@engine/render'
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
    return module(this.name, this.context)
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
      .map(node => this.getNode(node))
  }

  @transformer
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