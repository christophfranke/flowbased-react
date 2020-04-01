import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

import store from '@engine/store'
import { render } from '@engine/render'

@observer
class Preview extends React.Component {
  ref = React.createRef<HTMLDivElement>()

  componentDidMount() {
    if (this.ref.current) {    
      this.ref.current.addEventListener('error', e => {
        // TODO: Do something useful with it
      }, true)
    }
  }

  render() {
    if (store.tree) {
      return <div>
        {render(store.tree)}
      </div>
    }

    return <div ref={this.ref}>
      Create a Preview node to see a preview
    </div>
  }
}

export default Preview