import { Node } from '@engine/types'
import { value } from '@engine/render'

export default function(node: Node) {
  const entries = node.connections.input.map(connection => value(connection.node))
  console.log(entries)
  const result = entries.reduce((obj,{ key, value }) => ({
    ...obj,
    [key]: value
  }), {})

  console.log(result)
  return result
}