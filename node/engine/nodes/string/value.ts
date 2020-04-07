import { Node } from '@engine/types'

export default function(node: Node): string {
  return node.params.value
}