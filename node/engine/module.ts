import { Module, Context, Node, Scope, ModuleNodes, Port } from '@engine/types'
import { filteredSubForest, NodeForest, NodeTree } from '@engine/tree'
import { deliveredType } from '@engine/render'
import { computedFunction } from '@engine/util'

const outputTypes = (define: Node, input: NodeTree, forest: NodeForest) => (node: Node, context: Context) => {
  const newContext = {
    ...context,
    types: {
      ...context.types,
      [define.id]: deliveredType(node, 'output', context),
      ...forest.filter(tree => tree !== input)
        .reduce((obj, tree) => ({
          ...obj,
          input: {
            [tree.node.params.name]: node.connections.input[tree.node.params.name]
              ? deliveredType(
                node.connections.input[tree.node.params.name][0].src.node,
                node.connections.input[tree.node.params.name][0].src.key,
                context
              ) // this context might need the define type in some edge cases.
              : undefined
            }
        }), {})
    }
  }

  const expectedType = deliveredType(input.node, 'output', newContext)
  if (input.node.params.duplicate) {
    if (expectedType.name !== 'Array') {
      return context.modules.Core.Type.Mismatch.create(`Array expected but got ${expectedType.name}`)
    }

    return expectedType.params.items
  }

  return expectedType  
}

export function module(name: string, defines: Node[]): Module {
  return {
    name,
    Type: {},
    Node: defines.reduce((obj: ModuleNodes<string>, define: Node): ModuleNodes<string> => ({
      ...obj,
      [`define-${define.id}`]: {
        value: (node: Node, scope: Scope) => {
          return scope.context.modules.Define.Node.Proxy.value(node, scope, 'output')
        },
        type: {
          get output() {
            const forest = filteredSubForest(define, candidate => candidate.type === 'Output')

            return forest.reduce((obj, output) => ({
              ...obj,
              [output.node.params.name]: (node: Node, context: Context) => {
                return context.modules.Core.Type.Unresolved.create()
              }
            }), {
              output: (node: Node, context: Context) => {
                return context.modules.Define.Node.Proxy.type.output!.output!(node, context)
              }
            })
          },
          get input() {
            const forest = filteredSubForest(define, candidate => candidate.type === 'Input')

            return forest.reduce((obj, input) => ({
              ...obj,
              [input.node.params.name]: outputTypes(define, input, forest)
            }), {})
          }
        }
      }
    }), {})
  }
}
