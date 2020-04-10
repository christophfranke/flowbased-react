import React from 'react'
import { observer, Provider } from 'mobx-react'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'

import Store from '@editor/store'
const syncedStore = Store.createFromLocalStorage()

@observer
class Nodes extends React.Component {
  render() {
    return <div>
      <Provider store={syncedStore}>
        <Viewport dimensions={{ x: 0, y: 0, width: 100, height: 100 }}>
          <EditorView  />
        </Viewport>
      </Provider>
    </div>
  }
}

export default Nodes