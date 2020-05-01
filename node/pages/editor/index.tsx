import React from 'react'
import { observer, Provider } from 'mobx-react'
import fetch from 'isomorphic-fetch'
import Router from 'next/router'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'

import Store from '@editor/store'

import './editor.scss'


@observer
class EditorCreate extends React.Component {
  addDocument = async () => {    
    const result = await fetch('/api/documents/add', {
      method: 'post'
    })

    const data = await result.json()
    if (data.id) {
      Router.push('/editor/[id]', `/editor/${data.id}`)
    }
  }
  
  componentDidMount() {
    this.addDocument()
  }

  render() {
    return <div>
      redirecting...
    </div>
  }
}

export default EditorCreate