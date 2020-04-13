import { Node } from '@engine/types'
import { unique, flatten } from '@shared/util'

interface NodeTree {
  node: Node,
  children: NodeTree[]
}
type NodeForest = NodeTree[]

function children(node: Node): Node[] {
  return unique(
    node.connections.input.map(con => con.node)
      .concat(node.connections.properties.map(con => con.node))
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
