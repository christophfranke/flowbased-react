import React from 'react'
import { observer, Provider } from 'mobx-react'
import fetch from 'isomorphic-fetch'
import Router from 'next/router'


import './editor.scss'

import Viewport from '@editor/components/viewport'
import DocumentBrowser from '@components/document-browser'


@observer
class EditorEmpty extends React.Component {
  render() {
    return <div>
      <Viewport dimensions={{ x: 0, y: 0, width: 100, height: 100 }}>
        <div style={{ color: 'white', backgroundColor: 'rgb(25, 25, 25)', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '24px' }}>No graph selected</h2>
        </div>
      </Viewport>
      <DocumentBrowser selectedId={null} />
    </div>
  }
}

export default EditorEmpty