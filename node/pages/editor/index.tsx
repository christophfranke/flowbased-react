import React from 'react'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'

export default () => {
  return <div>
    <Viewport dimensions={{ x: 0, y: 0, width: 100, height: 50 }}>
      <EditorView  />
    </Viewport>
    <Viewport dimensions={{ x: 0, y: 50, width: 100, height: 50 }}>
      <EditorView  />
    </Viewport>
  </div>
}