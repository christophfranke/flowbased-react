import { Node, Port } from '@engine/types'
import { computedFunction } from '@engine/util'
import { unique, flatten } from '@engine/util'

export interface NodeTree {
  node: Node,
  children: NodeTree[]
}
export type NodeForest = NodeTree[]

export function children(node: Node): Node[] {
  return unique(
    flatten(Object.values(node.connections.input).map(group => group.map(con => con.src.node)))
  )  
}

type Condition = (node: Node) => boolean
export function filteredSubForest(root: Node, condition: Condition): NodeForest {
  const visited = {}

  const recursion = root => {
    visited[root.id] = true
    if (condition(root)) {
      return [{
        node: root,
        children: flatten(children(root)
          .filter(child => !visited[child.id])
          .map(child => recursion(child)))
      }]
    }

    return flatten(children(root)
      .filter(child => !visited[child.id])
      .map(child => recursion(child)))
  }

  return recursion(root)
}

// same as filteredSubForest, but does not recurse
// into children of nodes the satisfy the condition
export function flatFilteredSubForest(root: Node, condition: Condition): NodeForest {
  const visited = {}

  const recursion = root => {
    visited[root.id] = true
    if (condition(root)) {
      return [{
        node: root,
        children: []
      }]
    }

    return flatten(
      children(root)
        .filter(child => !visited[child.id])
        .map(child => recursion(child)))
  }

  return recursion(root)
}

export function findChild(root: Node, condition: Condition): Node | null {
  const forest = flatFilteredSubForest(root, condition)
  if (forest.length > 0) {
    return forest[0].node
  }

  return null
}

export const match = computedFunction(function(root: Node, flattener: Condition, deepener: Condition): Node | undefined {
  const visited = {}

  const recursion = (node, depth) => {
    visited[node.id] = true
    const newDepth = depth + (flattener(node) ? -1 : 0) + (deepener(node) ? 1 : 0)

    if (newDepth === 0) {
      return node
    }

    return children(node)
      .filter(child => !visited[child.id])
      .map(child => recursion(child, newDepth)).find(result => result)
  }

  return recursion(root, 0)
})

export const allOutputs = computedFunction(function(node: Node): Port[] {
  return flatten(Object.values(node.connections.output)
    .map(group => group.map(connection => connection.target)))
})

export const outputs = computedFunction(function(node: Node, key): Port[] {
  return node.connections.output[key]
    ? node.connections.output[key].map(connection => connection.target)
    : []
})

export const inputs = computedFunction(function(node: Node): Port[] {
  return flatten(Object.values(node.connections.input)
    .map(group => group.map(connection => connection.src)))
})

export const firstInput = computedFunction(function(node: Node): Port | undefined {
  return inputs(node)[0]
})

export const inputAt = computedFunction(function(node: Node, key: string): Port | undefined {
  return node.connections.input[key]
    && node.connections.input[key][0]
    && node.connections.input[key][0].src
})

export const inputsAt = computedFunction(function(node: Node, key: string): Port[] {
  return node.connections.input[key]
    ? node.connections.input[key].map(con => con.src)
    : []
})

