import { observable } from 'mobx'
import { useStaticRendering } from "mobx-react"
import { Node } from '@engine/types'
import { EditorNode, EditorGlobals } from '@editor/types'

import createNode from '@engine/create-node'
import createEditorNode from '@editor/create-node'

const isServer = typeof window === 'undefined'

useStaticRendering(isServer)


class Tree {
  @observable root: Node
  @observable displayNodes: EditorNode[]
  @observable editor: EditorGlobals = {
    mousePosition: {
      x: 0,
      y: 0
    },
    sheetDimensions: {
      x: 0, // px
      y: 500, // px
    },
    highZ: 0,
    pendingConnections: [],
    establishedConnections: []
  }

  pxToPercentage(pixel: number): number {
    return 100 * pixel / this.editor.sheetDimensions.x
  }

  percentageToPx(percentage: number): number {
    return this.editor.sheetDimensions.x * percentage / 100
  }

  getHighZ() {
    this.editor.highZ += 1
    return this.editor.highZ
  }

  constructor() {
    if (!isServer) {
      this.editor.sheetDimensions.x = window.innerWidth / 2
      window.addEventListener('resize', () => {
        this.editor.sheetDimensions.x = window.innerWidth / 2
      })
      window.addEventListener('mousemove', e => {
        this.editor.mousePosition = {
          x: e.clientX,
          y: e.clientY
        }
      })
    }

    this.root = createNode('Output')
    this.displayNodes = [createEditorNode(this.root, { type:
      'Output',
      editable: false,
      position: {
        x: 50,
        y: this.editor.sheetDimensions.y
      }
    })]
  }
}

const tree = new Tree()

if (typeof window !== 'undefined') {
  window['tree'] = tree
}

export default tree