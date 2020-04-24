import React from 'react'
import { Provider, observer } from 'mobx-react'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'
import Preview from '@editor/components/preview'

import Store from '@editor/store'
const syncedStore = Store.createFromLocalStorage()

@observer
class SplitScreen extends React.Component {
  render() {
    return <div>
      <Provider store={syncedStore}>
        <Viewport dimensions={{ x: 0, y: 0, width: 50, height: 100 }}>
          <EditorView  />
        </Viewport>
        <Viewport dimensions={{ x: 50, y: 0, width: 50, height: 100 }}>
          <Preview  />
        </Viewport>
      </Provider>
    </div>
  }
}

export default SplitScreen