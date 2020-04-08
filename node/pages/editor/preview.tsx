import React from 'react'
import { observable } from 'mobx'
import { observer, Provider } from 'mobx-react'

import Viewport from '@editor/components/viewport'
import Preview from '@editor/components/preview'

import StorageStore from '@shared/storage-store'

const store = typeof window !== 'undefined'
  ? new StorageStore()
  : null

@observer
class EditorPreview extends React.Component {
  render() {
    if (store) {    
      return <div>
        <Provider store={store}>
          <Viewport dimensions={{ x: 0, y: 0, width: 100, height: 100 }}>
            <Preview  />
          </Viewport>
        </Provider>
      </div>
    }

    return <div>This component cannot be rendered on the server</div>
  }
}

export default EditorPreview