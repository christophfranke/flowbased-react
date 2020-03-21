import { observable } from 'mobx'
import { useStaticRendering } from "mobx-react"
import { Node } from '@engine/types'

import { create } from '@engine/node'

useStaticRendering(typeof window === 'undefined')


const createRoot = (): Node => {
  const hello = create('Text', { text: 'Hello World' })
  const lorem = create('Text', { text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.' })
  const headline = create('H1', [
    { node: hello }
  ])
  const root = create('Combine', [
    { node: headline },
    { node: lorem }
  ])

  console.log(root)

  return root
}

class Tree {
  @observable root: Node = createRoot()
}

export default new Tree()