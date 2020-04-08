import React from 'react'
import { Provider } from 'mobx-react'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'

import Store from '@editor/store'

const syncedStore = Store.createFromLocalStorage()

export default () => {
  return <div>
    <Provider store={syncedStore}>
      <Viewport dimensions={{ x: 0, y: 0, width: 100, height: 100 }}>
        <EditorView  />
      </Viewport>
    </Provider>
  </div>
}