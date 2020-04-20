import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, type, unmatchedType, inputValue } from '@engine/render'
import { inputs, outputs } from '@engine/tree'
import { intersectAll, createEmptyValue } from '@engine/type-functions'


export const Dependencies = ['Core']

export type Nodes = 'Expression'
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
  }
}

export type Types = never
export const Type: Engine.ModuleTypes<Types> = {}
