import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, type, unmatchedType } from '@engine/render'
import { inputs, outputs } from '@engine/tree'
import { intersectAll, createEmptyValue } from '@engine/type-functions'

export const Dependencies = ['Core']

export type Nodes = 'Define' | 'Proxy' | 'Input'
export const Node: Engine.ModuleNodes<Nodes> = {
  Define: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const input = inputs(node)[0]
      return input
        ? value(input.node, scope, input.key)
        : createEmptyValue(scope.context.modules.Core.Type.Unresolved.create())
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => intersectAll(
          inputs(node).map(src => unmatchedType(src.node, context, src.key)),
          context
        )
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => type(node, context)
      }
    }
  },
  Input: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const input = scope.locals.input && scope.locals.input[node.params.name]
      return input && input.length > 0
        ? value(input[0].src.node, scope.parent || scope, input[0].src.key)
        : createEmptyValue(type(node, (scope.parent || scope).context))
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          const result = context.types.input
            ? context.types.input
            : context.modules.Core.Type.Unresolved.create()

          console.log('input type', result)
          return result
        }
      }
    }
  },
  Proxy: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const define = scope.context.defines
        .find(other => other.id === Number(node.params.define))

      const newScope = {
        ...scope,
        parent: scope,
        locals: {
          ...scope.locals,
          input: node.connections.input
        }
      }

      return define
        ? value(define, newScope, 'output')
        : createEmptyValue(type(node, scope.context))
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          const newContext = {
            ...context,
            types: {
              ...context.types,
              input: intersectAll(
                inputs(node).map(src => unmatchedType(src.node, context, src.key)),
                context
              )
            }
          }

          const define = context.defines
            .find(other => other.id === Number(node.params.define))

          return define
            ? unmatchedType(define, newContext, 'output')
            : context.modules.Core.Type.Mismatch.create(`Cannot find define node ${node.params.define}`)
        }
      },
      // input: {
        // input: (node: Engine.Node, context: Engine.Context) => {
          // return context.modules.Core.Type.Null.create()
          // const define = getStaticGlobalScope().locals.defines
          //   .find(other => other.id === node.params.define)

          // if (!define) {
          //   return TypeDefinition.Null
          // }

          // const forest = filteredSubForest(define, candidate => candidate.name === 'Input')
          // return forest.length > 0
          //   ? unionAll(forest.map(tree => type(tree.node)))
          //   : TypeDefinition.Null
        // }
      // }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<'Define' | 'Input'> = {
  Define: {
    name: 'Define',
    type: 'Define',
    documentation: {
      explanation: '',
      input: {
        input: ''
      },
      output: {
        output: ''
      }
    },
    ports: {
      output: {
        output: ['hidden']
      }
    },
    create: () => ({
      type: 'Define',
      params: [{
        name: 'Name',
        key: 'name',
        value: '',
        type: 'text'
      }],
    })    
  },
  Input: {
    name: 'Input',
    type: 'Input',
    documentation: {
      explanation: '',
      output: {
        output: ''
      }
    },
    create: () => ({
      type: 'Input',
      params: [{
        name: 'Name',
        key: 'name',
        value: 'input',
        type: 'text'
      }],
    })
  }
}

export type Types = never
export const Type: Engine.ModuleTypes<Types> = {}
