import { Module, Context, Node, Scope, ModuleNodes, Port } from '@engine/types'
import { filteredSubForest, NodeForest, NodeTree } from '@engine/tree'
import { deliveredType, inputTypeAt } from '@engine/render'
import { computedFunction } from '@engine/util'
import { setType, subContext } from '@engine/context'

const outputTypes = (define: Node, input: NodeTree, forest: NodeForest) => (node: Node, context: Context) => {
  const newContext = subContext(context)
  setType(newContext, define, 'output', deliveredType(node, 'output', context))
  forest.filter(tree => tree !== input).forEach(tree => {
    setType(newContext, tree.node, 'output', inputTypeAt(node, tree.node.params.name, context))
  })

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
        value: (node: Node, scope: Scope, key: string) => {
          return scope.context.modules.Define.Node.Proxy.value(node, scope, key)
        },
        type: {
          get output() {
            const forest = filteredSubForest(define, candidate => candidate.type === 'Output')

            return forest.reduce((obj, output) => ({
              ...obj,
              [output.node.params.name]: (node: Node, context: Context) => {
                return deliveredType(output.node, 'output', context)
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
