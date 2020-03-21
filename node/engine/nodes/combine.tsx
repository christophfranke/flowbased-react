import React from 'react'

import { Input, Node } from '@engine/types'
import render from '@engine/render'

export default class Combine implements Node {
  inputs: Input[] = []

  output() {
    return () => <React.Fragment>
      {render(this.inputs)}
    </React.Fragment>
  }
}