import { Module, Context, Node, Scope, ModuleNodes } from '@engine/types'
import { filteredSubForest } from '@engine/tree'
import { type } from '@engine/render'
import { computedFunction } from '@engine/util'

export function module(name: string, context: Context): Module {
  return {
    name,
    Type: {},
    Node: context.defines.reduce((obj: ModuleNodes<string>, define: Node): ModuleNodes<string> => ({
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
                    [define.id]: type(node, context),
                    ...forest.filter(tree => tree !== input)
                      .reduce((obj, tree) => ({
                        ...obj,
                        input: {
                          [tree.node.params.name]: node.connections.input[tree.node.params.name]
                            ? type(node.connections.input[tree.node.params.name][0].src.node, context) // this context might need the define type in some edge cases.
                            : undefined
                          }
                      }), {})
                  }
                }

                const expectedType = type(input.node, newContext)
                if (input.node.params.duplicate) {
                  if (expectedType.name !== 'Array') {
                    return context.modules.Core.Type.Mismatch.create(`Array expected but got ${expectedType.name}`)
                  }

                  return expectedType.params.items
                }

                return expectedType
              }
            }), {})
          }
        }
      }
    }), {})
  }
}
