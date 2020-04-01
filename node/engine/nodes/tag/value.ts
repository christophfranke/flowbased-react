import { Node } from '@engine/types'

export default function(node: Node) {
  return {
    tag: node.params.tag
  }
}