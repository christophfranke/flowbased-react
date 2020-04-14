import { computed } from 'mobx'
import { Node, Vector } from '@editor/types'

import Store from '@editor/store'

interface nodeListItem {
  name: string
  type: string
  module: string
  create: (position: Vector) => Node
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

  @computed get nodeList() {
    return [{
      name: 'String',
      type: 'Value',
      module: 'Core',
      create: this.createStringNode.bind(this)
    }].sort((a, b) => {
      if (a.type === b.type) {
        return a.name < b.name ? -1 : 1
      }
      return a.type < b.type ? -1 : 1
    })
  }

  // getParamValue(node: Node, key: string): string {
  //   const nameParam = node.params.find(param => param.key === key)
  //   return nameParam && nameParam.value
  // }

  createStringNode(position: Vector): Node {
    return {
      id: this.store.uid(),
      name: 'String',
      type: 'String',
      position
    } as Node
  }
}
