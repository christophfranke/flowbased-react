import { Node } from '@engine/types'

export default (src: Node, target: Node) => {
  if (src !== target) {
    target.inputs.push({ node: src })
  }
}