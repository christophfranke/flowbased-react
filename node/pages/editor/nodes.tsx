import React from 'react'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'

export default () => {
  return <div>
    <Viewport dimensions={{ x: 0, y: 0, width: 100, height: 100 }}>
      <EditorView  />
    </Viewport>
  </div>
}