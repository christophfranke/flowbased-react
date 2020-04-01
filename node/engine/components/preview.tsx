import React from 'react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'

import store from '@engine/store'
import render from '@engine/render'

@observer
class Preview extends React.Component {
  render() {
    if (store.tree) {
      return <div>
        {render(store.tree)}
      </div>
    }

    return <div>
      Create a Preview node to see a preview
    </div>
  }
}

export default Preview