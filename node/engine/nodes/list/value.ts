import { Node } from '@engine/types'
import { value } from '@engine/render'

export default function(node: Node) {
  return node.connections.input.map(connection => value(connection.node))
}