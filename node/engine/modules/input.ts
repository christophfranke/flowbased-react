import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, type, unmatchedType } from '@engine/render'
import { createEmptyValue, intersectAll } from '@engine/type-functions'
import { inputs } from '@engine/tree'

export const Dependencies = ['Core', 'Array', 'Object']

export const name = 'Input'
export type Nodes = 'Textarea' | 'StringRecord' | 'List'
export const Node: Engine.ModuleNodes<Nodes> = {
  List: {
    value: (node: Engine.Node) => {
      return node.params.value
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Array.Type.Array.create(context.modules.Core.Type.String.create())
      }
    }
  },
  Textarea: {
    value: (node: Engine.Node) => {
      return node.params.value
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Core.Type.String.create()
      }
    }
  },
  StringRecord: {
    value: (node: Engine.Node) => {
      return { ...(node.params.value as {}) }
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Object.Type.Object.create(Object.keys(node.params.value)
            .filter(key => key)
            .reduce((obj, key) => ({
              ...obj,
              [key.trim()]: context.modules.Core.Type.String.create()
            }), {}))
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Textarea: {
    name: 'Textarea',
    type: 'Value',
    documentation: {
      explanation: 'Creates a large textarea for text input.',
      params: {
        value: 'Here you can type in the text.'
      },
      output: {
        output: 'Output is a *String*.'
      }
    },
    create: () => ({
      type: 'Textarea',
      params: [{
        name: '',
        key: 'value',
        value: '',
        type: 'textarea'
      }],
    })
  },
  StringRecord: {
    name: 'String Record',
    type: 'Value',
    documentation: {
      explanation: 'Creates a key - value list of strings. Useful to define styles.',
      params: {
        value: 'These define the key - value pairs.'
      },
      output: {
        output: 'Output is an *Object*'
      }
    },
    create: () => ({
      type: 'StringRecord',
      params: [{
        name: '',
        key: 'value',
        value: {},
        type: 'pairs'
      }],
    })
  },
  List: {
    name: 'List',
    type: 'Value',
    documentation: {
      explanation: 'Creates a list of *Strings*. Useful for CSS class names.',
      params: {
        value: 'These define the *Strings*.'
      },
      output: {
        output: 'Output is an *Array* of *String*'
      }
    },
    create: () => ({
      type: 'List',
      params: [{
        name: '',
        key: 'value',
        value: [],
        type: 'textlist'
      }],
    })
  },}

export type Types = never
export const Type: Engine.ModuleTypes<Types> = {}
