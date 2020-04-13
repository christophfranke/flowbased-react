import { Scope, Node, Locals } from '@engine/types'
import Nodes, { ScopeDescriptor } from '@engine/nodes'
import { flatten, unique } from '@shared/util'


// TODO: For a decent collect node, we need a tree here
export function childEntries(node: Node, filter?: (descriptor: ScopeDescriptor) => boolean): ScopeDescriptor[] {
  return unique(flatten(node.connections.input.concat(node.connections.properties)
    .map(connection => entries(connection.node, filter))), (a, b) => a.owner == b.owner)
}

export function entries(node: Node, filter: (descriptor: ScopeDescriptor) => boolean = () => true): ScopeDescriptor[] {
  const ownScopes: ScopeDescriptor[] = Nodes[node.name].entry
    ? [Nodes[node.name].entry!(node)]
    : []

  const exit = Nodes[node.name].exit || (() => false)
  return ownScopes.concat(childEntries(node).filter(descriptor => filter(descriptor) && !exit(descriptor)))
}

export function createScope(parent: Scope, locals: { [key: string]: any }): Scope {
  return {
    parent,
    locals
  }
}

// TODO: Make it an environment or something like this
// Do not mix scopes and types
let staticGlobalScope: Scope
export function setStaticGlobalScope(scope: Scope) {
  staticGlobalScope = scope
}

export function getStaticGlobalScope(): Scope {
  return staticGlobalScope
}

export function getGlobalScope(current: Scope): Scope {
  if (current.parent) {
    getGlobalScope(current.parent)
  }

  return current
}