import { Node, Input, NodeType } from '@engine/types'

let internalIdCounter = 0
const uid = () => {
  internalIdCounter += 1
  return internalIdCounter
}

export default function create(type: NodeType): Node
export default function create(type: NodeType, inputs: Input[]): Node
export default function create(type: NodeType, params: Object): Node
export default function create(type: NodeType, params: Object, inputs: Input[]): Node

export default function create(type: NodeType, arg1?: Input[] | Object, arg2?: Input[] | Object): Node {
  let inputs: Input[] = []
  let params: Object = {}

  if (Array.isArray(arg1)) {
    inputs = arg1
  } else if (Array.isArray(arg2)) {
    inputs = arg2
  }

  if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
    params = arg1
  } else if (arg2 && typeof arg2 === 'object' && !Array.isArray(arg2)) {
    params = arg2
  }

  return {
    id: uid(),
    params,
    type,
    inputs
  }
}
