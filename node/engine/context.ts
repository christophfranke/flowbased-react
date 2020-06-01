import { observable, computed } from 'mobx'
import { Scope, Context, Node, ValueType } from '@engine/types'
import { flatten } from '@engine/util'
import { GraphStorage } from '@service/graph-storage'

export function subContext(context: Context): Context {
  return {
    get modules() {
      return context.modules
    },
    get defines() {
      return context.defines
    },
    types: {
      ...context.types
    }
  }
}

export function setType(context: Context, node: Node, key: string, type: ValueType) {
  context.types[node.id] = {
    ...(context.types[node.id] || {}),
    [key]: type
  }
}

export function subScope(scope: Scope) {
  return {
    ...scope,
    context: subContext(scope.context)
  }
}


export class ReactiveContext implements Context {
  private graphStorage: GraphStorage
  constructor(graphStorage: GraphStorage) {
    this.graphStorage = graphStorage
    const context = this
  }

  types = {}
  get modules() {
    return this.graphStorage.modules
  }
  get defines() {
    return flatten(Object.values(this.graphStorage.stores).map(store => store.translated.defines))
  }
}