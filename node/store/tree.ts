import { observable } from 'mobx'
import { useStaticRendering } from "mobx-react"
import { Node } from '@engine/types'

import createNode from '@engine/create-node'

const isServer = typeof window === 'undefined'

useStaticRendering(isServer)


class Tree {
  @observable root: Node

  constructor() {
    this.root = createNode('Output')
  }
}

const tree = new Tree()

// TODO: Remove exposure to window
if (typeof window !== 'undefined') {
  window['tree'] = tree
}

export default tree