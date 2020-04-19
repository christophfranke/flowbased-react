import { Node, Port } from '@engine/types'
import { computedFunction } from '@engine/util'
import { unique, flatten } from '@shared/util'

interface NodeTree {
  node: Node,
  children: NodeTree[]
}
type NodeForest = NodeTree[]

function children(node: Node): Node[] {
  return unique(
    flatten(Object.values(node.connections.input).map(group => group.map(con => con.src.node)))
  )  
}

type Condition = (node: Node) => boolean
export function filteredSubForest(root: Node, condition: Condition): NodeForest {
  if (condition(root)) {
    return [{
      node: root,
      children: flatten(children(root).map(child => filteredSubForest(child, condition)))
    }]
  }

  return flatten(children(root).map(child => filteredSubForest(child, condition)))
}

// same as filteredSubForest, but does not recurse
// into children of nodes the satisfy the condition
export function flatFilteredSubForest(root: Node, condition: Condition): NodeForest {
  if (condition(root)) {
    return [{
      node: root,
      children: []
    }]
  }

  return flatten(children(root).map(child => filteredSubForest(child, condition)))
}

export const outputs = computedFunction(function(node: Node): Port[] {
  return flatten(Object.values(node.connections.output)
    .map(group => group.map(connection => connection.target)))
})

export const inputs = computedFunction(function(node: Node): Port[] {
  return flatten(Object.values(node.connections.input)
    .map(group => group.map(connection => connection.src)))
})