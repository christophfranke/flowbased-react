import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, deliveredType, inputValueAt, inputValuesAt, inputTypesAt, inputTypeAt } from '@engine/render'
import { unique } from '@engine/util'
import { inputs } from '@engine/tree'
import { intersectAll, createEmptyValue, testValue, union, intersect, matchInto } from '@engine/type-functions'


export const Dependencies = ['Core']

export const name = 'Object'
export type Nodes = 'Object' | 'Pair' | 'Key'
export const Node: Engine.ModuleNodes<Nodes> = {
  Object: {
    value: (node: Engine.Node, scope: Engine.Scope) =>
      inputValuesAt(node, 'input', scope)
        .reduce((obj, pair) => ({
          ...obj,
          ...pair
        }), {}),
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => Type.Object.create(
          inputTypesAt(node, 'input', context)
          .reduce((obj, inputType) => ({
            ...obj,
            ...(inputType.name === 'Object'
              ? inputType.params
              : {})
          }), {}))
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => Type.Object.create({})
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
        output: (node: Engine.Node, context: Engine.Context) => {
          if (!node.params.key.trim()) {
            return context.modules.Core.Type.Null.create()
          }
          const inputType = inputTypeAt(node, 'input', context)
          if (inputType.name === 'Unresolved') {
            return inputType
          }

          if (inputType.name === 'Object') {
            return inputType.params[node.params.key.trim()]
              || context.modules.Core.Type.Mismatch.create(`Expected Object with key ${node.params.key.trim()}`)
          }

          return context.modules.Core.Type.Mismatch.create(`Expected Object, got ${inputType.name}`)
        }
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => Type.Object.create(
          node.params.key.trim()
            ? { [node.params.key.trim()]: deliveredType(node, 'output', context) }
            : {}
        )
      }
    }
  },
  Pair: {
    value: (node: Engine.Node, scope: Engine.Scope) => node.params.key.trim()
      ? {
        [node.params.key.trim()]: inputValueAt(node, 'input', scope)
      } : {},
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) =>
          Type.Object.create(
            node.params.key.trim()
            ? {
              [node.params.key.trim()]: inputTypeAt(node, 'input', context)
            } : {}
          )
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => {
          return context.modules.Core.Type.Unresolved.create()
          // const nodeType = deliveredType(node, 'output', context)
          // if (nodeType.name === 'Unresolved') {
          //   return nodeType
          // }

          // return deliveredType(node, 'output', context).params.value
        }
      }
    }
  },
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Object: {
    name: 'Merge',
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

export type Types = 'Object'
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
    },
    combine: {
      union: (src: Engine.ValueType, target: Engine.ValueType, context: Engine.Context) => {
        const srcParams = Object.keys(src.params)
        const targetParams = Object.keys(target.params)
        const keys = unique(srcParams.concat(targetParams))

        const params = keys.map(key => ({
          key,
          type: union(
            src.params[key] || context.modules.Core.Type.Unresolved.create(),
            target.params[key] || context.modules.Core.Type.Unresolved.create(),
            context
          )
        })).reduce((obj, { key, type }) => ({
          ...obj,
          [key]: type
        }), {})

        return context.modules.Object.Type.Object.create(params)        
      },
      intersect: (src: Engine.ValueType, target: Engine.ValueType, context: Engine.Context) => {
        const srcParams = Object.keys(src.params)
        const targetParams = Object.keys(target.params)
        const keys = srcParams.filter(key => targetParams.includes(key))

        const params = keys.map(key => ({
          key,
          type: intersect(src.params[key], target.params[key], context)
        })).reduce((obj, { key, type }) => ({
          ...obj,
          [key]: type
        }), {})

        return context.modules.Object.Type.Object.create(params)      
      },
      matchInto: (src:Engine.ValueType, target: Engine.ValueType, context: Engine.Context) => {
        const srcParams = Object.keys(src.params)
        const targetParams = Object.keys(target.params)
        const keys = unique(srcParams.concat(targetParams))

        const params = keys.map(key => ({
          key,
          type: matchInto(
            src.params[key] || context.modules.Core.Type.Mismatch.create(`Expected Object with key ${key}`),
            target.params[key] || context.modules.Core.Type.Unresolved.create(),
            context
          )
        })).reduce((obj, { key, type }) => ({
          ...obj,
          [key]: type
        }), {})

        return context.modules.Object.Type.Object.create(params)        
      }
    },
  }
}
