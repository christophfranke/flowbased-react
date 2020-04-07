import React from 'react'
import { Provider } from 'mobx-react'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'
import Preview from '@editor/components/preview'

import Store from '@editor/store'
const splitStore = new Store()

export default () => {
  return <div>
    <Provider store={splitStore}>
      <Viewport dimensions={{ x: 0, y: 0, width: 50, height: 100 }}>
        <EditorView  />
      </Viewport>
      <Viewport dimensions={{ x: 50, y: 0, width: 50, height: 100 }}>
        <Preview  />
      </Viewport>
    </Provider>
  </div>
}