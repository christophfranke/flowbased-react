import React from 'react'

import Viewport from '@editor/components/viewport'
import Preview from '@editor/components/preview'

export default () => {
  return <div>
    <Viewport dimensions={{ x: 0, y: 0, width: 100, height: 100 }}>
      <Preview  />
    </Viewport>
  </div>
}