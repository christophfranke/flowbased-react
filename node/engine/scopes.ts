import { Scope, Node, Locals } from '@engine/types'
import Nodes, { ScopeDescriptor } from '@engine/nodes'
import { flatten, unique } from '@shared/util'

export function childEntries(node: Node, current: Scope): ScopeDescriptor[] {
  return unique(flatten(node.connections.input.concat(node.connections.properties)
    .map(connection => entries(connection.node, current))), (a, b) => a.owner == b.owner)
}

export function entries(node: Node, current: Scope, filter: (descriptor: ScopeDescriptor) => boolean = () => true): ScopeDescriptor[] {
  const ownScopes: ScopeDescriptor[] = Nodes[node.name].entry
    ? [Nodes[node.name].entry!(node, current)]
    : []

  const exit = Nodes[node.name].exit || (() => false)
  return ownScopes.concat(childEntries(node, current).filter(descriptor => filter(descriptor) && !exit(descriptor)))
}

let global: Scope = {
  locals: {
    global: true
  },
  get parent() {
    return global
  }
}

export function getGlobalScope(): Scope {
  return global
}