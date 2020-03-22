import { Node } from '@engine/types'

export default (src: Node, target: Node) => {
  console.log('connecting', src, target, src !== target)
  if (src !== target) {
    target.inputs.push({ node: src })
  }
}