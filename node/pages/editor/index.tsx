import React from 'react'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'

export default () => {
  return <div>
    <Viewport dimensions={{ x: 0, y: 0, width: 50, height: 50 }}>
      <EditorView  />
    </Viewport>
    <Viewport dimensions={{ x: 0, y: 50, width: 50, height: 50 }}>
      <EditorView  />
    </Viewport>
    <Viewport dimensions={{ x: 50, y: 0, width: 50, height: 50 }}>
      <EditorView  />
    </Viewport>
    <Viewport dimensions={{ x: 50, y: 50, width: 50, height: 50 }}>
      <EditorView  />
    </Viewport>
  </div>
}