import React from 'react'
import { observer, Provider } from 'mobx-react'
import { observable, computed, autorun } from 'mobx'
import Router, { withRouter } from 'next/router'
import fetch from 'isomorphic-fetch'
import Link from 'next/link'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'

import Store from '@editor/store'

interface Document {
  _id: string
  name: string
}

interface Props {
  selectedId: string
  documentsKey: number
}

@observer
class EditorLoad extends React.Component<Props> {
  router = this.props['router']

  @observable documents: Document[] = []


  addDocument = async () => {    
    const result = await fetch('/api/documents/add', {
      method: 'post'
    })

    const data = await result.json()
    if (data.id) {
      Router.push('/editor/[id]', `/editor/${data.id}`)
    }

    this.fetchData()
  }

  async fetchData() {
    const result = await fetch('/api/documents')
    this.documents = await result.json()
  }

  componentDidMount() {
    autorun(() => {
      const id = this.props.documentsKey
      this.fetchData()
    })
  }

  render() {
    const panelStyle: React.CSSProperties = {
      position: 'fixed',
      left: '1vw',
      top: '1vw',
      backgroundColor: 'rgba(25, 25, 25, 0.7)',
      color: 'white',
      border: '1px solid white',
      padding: '8px 15px',
      borderRadius: '8px',
      marginBottom: '8px',
    }

    const selectedStyle: React.CSSProperties = { fontWeight: 'bold' }
    const linkStyle: React.CSSProperties = { cursor: 'pointer' }

    return <div style={panelStyle}>
      <h2 style={{ fontSize: '20px' }}>Graphs</h2>
      <div style={{ padding: '10px 0 0 10px' }}>
        {this.documents.map(document =>
          <Link key={document._id} href='/editor/[id]' as={`/editor/${document._id}`}>
            <div style={this.props.selectedId === document._id ? selectedStyle : linkStyle}>{document.name || 'Unnamed'}</div>
          </Link>)}
        <div style={{ ...linkStyle, marginTop: '8px' }} onClick={this.addDocument}>Create new Graph</div>
      </div>
    </div>
  }
}

export default EditorLoad