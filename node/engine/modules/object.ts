import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, deliveredType } from '@engine/render'
import { inputs, outputs } from '@engine/tree'
import { intersectAll, createEmptyValue, testValue } from '@engine/type-functions'


export const Dependencies = ['Core']

export const name = 'Object'
export type Nodes = 'Object' | 'Pair' | 'Key'
export const Node: Engine.ModuleNodes<Nodes> = {
  Object: {
    value: (node: Engine.Node, scope: Engine.Scope) => inputs(node)
      .map(port => value(port.node, scope, port.key))
      .filter(pair => pair.key)
      .reduce((obj, pair) => ({
        ...obj,
        [pair.key.trim()]: pair.value
      }), {}),
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => Type.Object.create(inputs(node)
          .filter(src => src.node.params.key)
          .map(src => ({
            key: src.node.params.key.trim(),
            type: deliveredType(src.node, src.key, context).params.value
              || context.modules.Core.Type.Mismatch.create(`Expected Pair, got ${deliveredType(src.node, src.key, context).name}`)
          }))
          .filter(pair => pair.key)
          .reduce((obj, pair) => ({
            ...obj,
            [pair.key.trim()]: pair.type
          }), {}))
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => Type.Pair.create(context.modules.Core.Type.Unresolved.create())
        // input: (node, other) => other && other.params.key
        // ? Type.Pair(type(node).params[other!.params.key.trim()])
        // : Type.Pair(Type.Unresolved)
      }
    }
  },
  Key: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      return inputs(node).length > 0
        ? value(inputs(node)[0].node, scope, inputs(node)[0].key)[node.params.key.trim()]
        : createEmptyValue(deliveredType(node, 'output', scope.context), scope.context)
    },
    type: {
      output: {
        output: (node:Engine. Node, context: Engine.Context) => {
          if (inputs(node).length > 0 && node.params.key) {
            const inputType = deliveredType(inputs(node)[0].node, inputs(node)[0].key, context)
            if (inputType.name !== 'Unresolved') {
              return inputType.params[node.params.key.trim()]
                || context.modules.Core.Type.Mismatch.create(`Expected Object with key ${node.params.key.trim()}`)
            }
          }

          return context.modules.Core.Type.Unresolved.create()
        }
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => node.params.key
          ? Type.Object.create({ [node.params.key.trim()]: deliveredType(node, 'output', context) })
          : Type.Object.create({})
      }
    }
  },
  Pair: {
    value: (node: Engine.Node, scope: Engine.Scope) => ({
      key: node.params.key.trim(),
      value: inputs(node).length > 0
        ? value(inputs(node)[0].node, scope, inputs(node)[0].key)
        : createEmptyValue(deliveredType(node, 'output', scope.context).params.value, scope.context)
    }),
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) =>
          Type.Pair.create(inputs(node).length > 0
            ? deliveredType(inputs(node)[0].node, inputs(node)[0].key, context)
            : context.modules.Core.Type.Unresolved.create())
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          const nodeType = deliveredType(node, 'output', context)
          if (nodeType.name === 'Unresolved') {
            return nodeType
          }

          return deliveredType(node, 'output', context).params.value
        }
      }
    }
  },
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Object: {
    name: 'Object',
    type: 'Value',
    documentation: {
      explanation: 'This node creates an *Object* value. An *Object* is a collection of key - value *Pairs*. The values can have any type (including *Object*) and may be all different. You can later use a *Key* node, to get access a value inside an object. *Objects* are useful, to bundle many values in a structured way.',
      input: {
        input: 'A key - vaule *Pair*, that will be put into the *Object*. If multiple *Pairs* with the same key are present, the rightmost input value will be chosen.'
      },
      output: {
        output: 'The *Object*'
      }
    },
    ports: {
      input: {
        input: ['duplicate']
      }
    },
    create: () => ({
      type: 'Object',
      params: [],
    })
  },
  Pair: {
    name: 'Pair',
    type: 'Value',
    documentation: {
      explanation: 'A key - value *Pair*. Its primary use is to feed an *Object*.',
      params: {
        key: 'This is the key if the key - value *Pair*. The key cannot be changed at runtime.'
      },
      input: {
        input: 'This is the value of the *Pair*. It can have any type.'
      },
      output: {
        output: 'The key - value *Pair*.'
      }
    },
    create: () => ({
      type: 'Pair',
      params: [{
        name: 'Key',
        key: 'key',
        value: '',
        type: 'text'
      }],
    })    
  },
  Key: {
    name: 'Key',
    type: 'Value',
    documentation: {
      explanation: 'This node gets the value of a key from an *Object*.',
      input: {
        input: 'The *Object* that has the key'
      },
      params: {
        key: 'The key you want to access.'
      },
      output: {
        output: 'The value of the key in the *Object*.'
      }
    },
    create:() => ({
      type: 'Key',
      params: [{
        name: 'Key',
        key: 'key',
        value: '',
        type: 'text'
      }]
    })
  }
}

export type Types = 'Object' | 'Pair'
export const Type: Engine.ModuleTypes<Types> = {
  Object: {
    create: (params: { [key: string]: Engine.ValueType }) => ({
      display: 'Object {}',
      name: 'Object',
      module: 'Object',
      params
    }),
    emptyValue: (type: Engine.ValueType, context: Engine.Context) => Object.entries(type.params).reduce((obj, [key, param]) => ({
      ...obj,
      [key]: createEmptyValue(param, context)
    }), {}),
    test: (value, type: Engine.ValueType, context: Engine.Context) => {
      return !Array.isArray(value) && typeof value === 'object'
        && Object.entries(type.params).every(([key, param]) => testValue(value[key], param, context))
    }
  },
  Pair: {
    create: (value: Engine.ValueType) => ({
      display: 'Pair<{value}>',
      name: 'Pair',
      module: 'Object',
      params: {
        value
      }
    }),
    emptyValue: (type: Engine.ValueType, context: Engine.Context) => {
      console.warn('empty pair create not implemented yet')
      return {
        key: '',
        value: createEmptyValue(type, context)
      }
    },
    test: (value) => {
      console.warn('test pair is not implemented yet')
      return true
    }
  }
}
