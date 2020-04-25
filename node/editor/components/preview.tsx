import React from 'react'
import { observable, computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Node, Connection } from '@editor/types'
import Translator from '@engine/translator'

import { value } from '@engine/render'
import graphStorage from '@service/graph-storage'

interface Props {
  store: {
    name: string
    nodes: Node[]
    connections: Connection[]
  }
}

@observer
class Preview extends React.Component<Props> {
  store = this.props.store

  ref = React.createRef<HTMLDivElement>()

  @computed get preview(): Node | undefined {
    return this.store.nodes.find(node => node.type === 'Preview')
  }

  translator = new Translator(this.store)

  componentDidMount() {
    if (this.ref.current) {    
      this.ref.current.addEventListener('error', e => {
        // TODO: Do something useful with it
      }, true)
    }
  }

  render() {
    if (this.preview) {
      const root = this.translator.getNode(this.preview) 
           
      return <div style={{ overflowY: 'auto', height: '100%' }}>
        {value(root, graphStorage.scope, 'output')}
      </div>
    }

    return <div ref={this.ref}>
      Create a Preview node to see a preview
    </div>
  }
}

export default Preview