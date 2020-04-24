import React from 'react'
import { observer, Provider } from 'mobx-react'
import { observable, computed } from 'mobx'
import Router, { withRouter } from 'next/router'
import fetch from 'isomorphic-fetch'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'
import DocumentBrowser from '@components/document-browser'

import Store from '@editor/store'

const currentId = () => window.location.pathname.split('/')[2]

@(withRouter as any)
@observer
class EditorLoad extends React.Component {
  router = this.props['router']
 
  @computed get store(): Store {
    return this.stores[this.id]
  }

  @observable stores: { [key: string]: Store } = {}
  @observable filenames: { [key: string]: string } = {}
  @observable loading = false
  @computed get filename(): string {
    return this.filenames[this.id]
  }

  @observable id: string

  changeFilename = (e) => {
    this.filenames[this.id] = e.target.value
  }

  clickSave = async () => {
    if (!this.loading) {    
      this.loading = true
      await this.saveData()
      this.loading = false
    }
  }

  async saveData() {
    if (this.id) {
      const result = await fetch(`/api/documents/${this.id}`, {
        method: 'POST',
        body: JSON.stringify({
          ...this.store.data,
          name: this.filename
        })
      })
    }
  }

  async fetchData() {
    if (this.id && !this.store) {
      const result = await fetch(`/api/documents/${this.id}`)
      const data = await result.json()
      
      this.stores[this.id] = Store.createFromData(data)
      if (data.name) {
        this.filenames[this.id] = data.name
      }
    }
  }

  componentDidMount() {
    this.router.events.on('routeChangeComplete', (...params) => {
      this.id = currentId()
      this.fetchData()
    })
  }

  render() {
    const buttonStyles = {
      backgroundColor: 'rgba(25, 25, 25, 0.7)',
      color: 'white',
      border: '1px solid white',
      padding: '8px 15px',
      borderRadius: '8px',
      marginBottom: '8px',
      cursor: this.loading ? 'progress' : 'pointer',
      opacity: this.loading ? 0.5 : 1
    }

    const filenameStyle: React.CSSProperties = {
      color: 'white',
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      top: '1vw',
      textAlign: 'center',
      fontSize: '24px',
      backgroundColor: 'rgba(25, 25, 25, 0.7)',
      borderRadius: '8px',
      border: '1px solid white'
    }

    return <div>
      <Viewport dimensions={{ x: 0, y: 0, width: 100, height: 100 }}>
        {this.store && <EditorView key={this.filename} store={this.store} /> || <div style={{ color: 'white', backgroundColor: 'rgb(25, 25, 25)', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '24px' }}>Loading...</h2>
        </div>}
      </Viewport>
      <DocumentBrowser selectedId={this.id} />
      <input value={this.filename} style={filenameStyle} onChange={this.changeFilename} />
      <div style={{ position: 'fixed', top: '1vw', right: '1vw', display: 'flex', flexDirection: 'column' }}>
        <button disabled={this.loading} onClick={this.clickSave} style={buttonStyles}>
          Save
        </button>
        <a href={`/preview/${this.id}`} target="_blank" style={buttonStyles}>
          Preview
        </a>
      </div>
    </div>
  }
}

export default EditorLoad