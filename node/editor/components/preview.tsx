import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'

import { Node } from '@editor/types'
import store from '@editor/store'

import Translator from '@shared/translator'

import { render } from '@engine/render'


@observer
class Preview extends React.Component {
  ref = React.createRef<HTMLDivElement>()
  @computed get preview(): Node | undefined {
    return store.nodes.find(node => node.type === 'Preview')
  }
  translator = new Translator(store)

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
        {render(root)}
      </div>
    }

    return <div ref={this.ref}>
      Create a Preview node to see a preview
    </div>
  }
}

export default Preview