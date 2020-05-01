import React from 'react'
import { observer, Provider } from 'mobx-react'
import { observable, computed } from 'mobx'
import Router, { withRouter } from 'next/router'
import fetch from 'isomorphic-fetch'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'
import DocumentBrowser from '@components/document-browser'

import Store from '@editor/store'
import graphStorage from '@service/graph-storage'
import loadDependencies from '@service/load-dependencies'

import './editor.scss'

const currentId = () => window.location.pathname.split('/')[2]


@(withRouter as any)
@observer
class EditorLoad extends React.Component {
  router = this.props['router']
 
  @computed get store(): Store {
    return graphStorage.stores[this.id]
  }

  @observable loading = false
  @computed get graphName(): string {
    return (graphStorage.stores[this.id] || { name: '' }).name
  }

  @observable id: string
  @observable documentBrowserKey = 1

  changeGraphName = (e) => {
    graphStorage.stores[this.id].name = e.target.value
  }

  clickDelete = async () => {
    if (!this.loading) {    
      this.loading = true
      await this.deleteGraph()
      this.loading = false
    }
  }

  clickSave = async () => {
    if (!this.loading) {    
      this.loading = true
      await this.saveGraph()
      this.loading = false
      this.documentBrowserKey += 1
    }
  }

  async deleteGraph() {
    if (this.id) {
      const result = await fetch(`/api/documents/${this.id}`, {
        method: 'DELETE',
      })

      delete graphStorage.stores[this.id]
      this.documentBrowserKey += 1
    }
  }

  async saveGraph() {
    if (this.id) {
      const result = await fetch(`/api/documents/${this.id}`, {
        method: 'POST',
        body: JSON.stringify({
          ...this.store.data,
          name: this.graphName
        })
      })
    }
  }

  async fetchData() {
    if (this.id && !this.store) {
      this.loading = true

      const data = await loadDependencies(this.id)
      console.log(data)
      Object.entries(data).forEach(([id, storeData]) => {
        if (!graphStorage.stores[id]) {
          graphStorage.stores[id] = Store.createFromData(storeData)
        }
      })
      
      this.loading = false
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

    const graphNameStyle: React.CSSProperties = {
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
        {this.store && !this.loading && <EditorView key={this.id} store={this.store} /> || <div style={{ color: 'white', backgroundColor: 'rgb(25, 25, 25)', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '24px' }}>{this.loading ? 'Loading...' : 'No Graph'}</h2>
        </div>}
      </Viewport>
      <DocumentBrowser selectedId={this.id} documentsKey={this.documentBrowserKey} />
      <input value={this.graphName} style={graphNameStyle} onChange={this.changeGraphName} />
      <div style={{ position: 'fixed', top: '1vw', right: '1vw', display: 'flex', flexDirection: 'column' }}>
        <button disabled={this.loading || !this.store} onClick={this.clickSave} style={buttonStyles}>
          Save
        </button>
        <button disabled={this.loading || !this.store} onClick={this.clickDelete} style={buttonStyles}>
          Delete
        </button>
        <a href={`/preview/${this.id}`} target="_blank" style={buttonStyles}>
          Preview
        </a>
      </div>
    </div>
  }
}

export default EditorLoad