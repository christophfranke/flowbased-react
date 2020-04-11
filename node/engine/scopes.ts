import { Scope, Node, Locals } from '@engine/types'
import Nodes, { ScopedValueResolver } from '@engine/nodes'
import { flatten, unique } from '@shared/util'

export function childResolvers(node: Node, current: Scope): ScopedValueResolver[] {
  return unique(flatten(node.connections.input.concat(node.connections.properties)
    .map(connection => scopeResolvers(connection.node, current))))
}

export function scopeResolvers(node: Node, current: Scope): ScopedValueResolver[] {
  const ownScopes: ScopedValueResolver[] = Nodes[node.name].resolveWithScope
    ? [Nodes[node.name].resolveWithScope!(node, current)]
    : []

  const scopeFilter = Nodes[node.name].scopeFilter || (x => x)
  return ownScopes.concat(scopeFilter(childResolvers(node, current)))
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