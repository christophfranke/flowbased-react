import { computed } from 'mobx'
import { Node, Vector, NodeDefinition } from '@editor/types'

import { flatten } from '@shared/util'
import Store from '@editor/store'

interface NodeListItem {
  name: string
  type: string
  module: string
  create: (position: Vector) => void
}

export default class NodeFunctions {
  store: Store
  constructor(store: Store) {
    this.store = store
  }

  // @computed get defineList() {
  //   return this.store.nodes
  //     .filter(node => node.type === 'Define')
  //     .map(node => ({
  //       name: this.getParamValue(node, 'name'),
  //       type: 'Local',
  //       create: position => this.createProxy(position, node)
  //     }))
  //     .filter(node => node.name)
  // }

  @computed get nodeList(): NodeListItem[] {
    const list = flatten(Object.entries(this.store.modules)
     .map(([module, definitions]) =>
        Object.entries(definitions.EditorNode)
          .map(([name, nodeDefinition]) => ({
            name,
            type: nodeDefinition.type,
            module,
            create: position => this.createNode(position, module, name)
          }))));

    return list.sort((a, b) => {
      if (a.module === b.module) {
        return a.name < b.name ? -1 : 1
      }
      return a.module < b.module ? -1 : 1
    })
  }


  createNode(position: Vector, module: string, name: string) {
    const nodeDefinition = this.store.modules[module].EditorNode[name]

    const node: Node = {
      ...nodeDefinition.create(),
      module,
      zIndex: 1,
      id: this.store.uid(),
      position
    }

    if (nodeDefinition.options && nodeDefinition.options.includes('singleton')) {
      const singletonNodes = this.store.nodes.filter(node => node.type === name)
      this.store.deleteNodes(singletonNodes)
    }

    this.store.nodes.push(node)
  }
}
