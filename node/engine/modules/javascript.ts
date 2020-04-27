import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, inputValue, deliveredType } from '@engine/render'
import { inputs, firstInput } from '@engine/tree'
import { intersectAll, createEmptyValue, testValue } from '@engine/type-functions'


export const Dependencies = ['Core']

export const name = 'Javascript'
export type Nodes = 'Expression' | 'TypeGuard'
export const Node: Engine.ModuleNodes<Nodes> = {
  Expression: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      let func
      try {
        func = new Function('x', 'y', 'z', `return ${node.params.code}`)
      } catch(e) {
        return undefined
      }
      const x = inputValue(node, 'x', scope)
      const y = inputValue(node, 'y', scope)
      const z = inputValue(node, 'z', scope)

      let result = undefined
      try {
        result = func.apply(scope, [x, y, z])
      } catch(e) {}

      return result
    },
    type: {
      input: {
        x: (node: Engine.Node, context: Engine.Context) => context.modules.Core.Type.Unresolved.create(),
        y: (node: Engine.Node, context: Engine.Context) => context.modules.Core.Type.Unresolved.create(),
        z: (node: Engine.Node, context: Engine.Context) => context.modules.Core.Type.Unresolved.create()
      },
      output: {
        output: (node: Engine.Node, context: Engine.Context) => context.modules.Core.Type.Unknown.create()
      }
    }
  },
  TypeGuard: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const input = firstInput(node)
      const typ = deliveredType(node, 'output', scope.context)
      if (input) {
        const val = value(input.node, scope, input.key)
        return testValue(val, typ, scope.context)
          ? val
          : createEmptyValue(typ, scope.context)
      }

      return createEmptyValue(typ, scope.context)
    },
    type: {
      input: {
        input: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Core.Type.Unknown.create()
      },
      output: {
        output: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Core.Type.Unresolved.create()        
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Expression: {
    name: 'Expression',
    type: 'Expression',
    documentation: {
      explanation: 'Evaluates a Javascript expression. `this` points to the current *Scope* of the node, which in turn holds the context including a reference to all other nodes and definitions.',
      input: {
        x: 'This input will be available as `x` in the expression',
        y: 'This input will be available as `y` in the expression',
        z: 'This input will be available as `z` in the expression'
      },
      params: {
        code: 'The expression to be evaluated'
      },
      output: {
        output: 'The result of the expression'
      }
    },
    create: () => ({
      type: 'Expression',
      params: [{
        name: '',
        key: 'code',
        value: '',
        type: 'text'
      }],
    })
  },
  TypeGuard: {
    name: 'Type Guard',
    type: 'Type',
    documentation: {
      explanation: 'Checks an unkown type and returns a known type'
    },
    create: () => ({
      type: 'TypeGuard',
      params: []
    })
  }
}

export type Types = never
export const Type: Engine.ModuleTypes<Types> = {}
