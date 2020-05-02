import React from 'react'
import { observer, Provider } from 'mobx-react'
import { observable, computed, autorun, IReactionDisposer } from 'mobx'
import fetch from 'isomorphic-fetch'

import { save } from '@shared/local-storage-sync'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'
import DocumentBrowser from '@components/document-browser'

import Store from '@editor/store'
import graphStorage from '@service/graph-storage'
import loadDependencies from '@service/load-dependencies'
import LocalStorageSync from '@service/local-storage-sync'

import './editor.scss'

const isServer = typeof window === 'undefined'

interface Props {
  id: string
  data: any
}

@observer
class EditorLoad extends React.Component<Props> {
  sync: LocalStorageSync
  static async getInitialProps(ctx) {
    const id = ctx.query.id
    const data = isServer 
      ? await loadDependencies(id)
      : {}

    return {
      id,
      data
    }
  }

  constructor(props) {
    super(props)
    graphStorage.fillWithData(props.data)
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.sync.setStoreId(this.props.id)
      await this.saveGraph(prevProps.id)
      const data = await loadDependencies(this.props.id)
      graphStorage.fillWithData(data)
    }
  }

  disposers: IReactionDisposer[] = []
  componentDidMount() {
    this.sync = new LocalStorageSync()
    this.sync.enableSending()
    this.sync.enableReceiving()
    this.sync.setStoreId(this.props.id)
  }

  componentWillUnmount() {
    this.sync.disableSending()
    this.sync.disableReceiving()
  }

  @computed get store(): Store | undefined {
    return graphStorage.stores[this.props.id]
  }

  @computed get graphName(): string {
    const result = (this.store || { name: '' }).name
    return result
  }

  @observable documentBrowserKey = 1

  changeGraphName = (e) => {
    if (this.store) {
      this.store.name = e.target.value
    }
  }

  clickDelete = async () => {
    await this.deleteGraph()
  }

  clickSave = async () => {
    await this.saveGraph(this.props.id)
    this.documentBrowserKey += 1
  }

  blurGraphname = async () => {
    await this.saveGraph(this.props.id)
    this.documentBrowserKey += 1
  }

  async deleteGraph() {
    if (this.props.id) {
      const result = await fetch(`/api/documents/${this.props.id}`, {
        method: 'DELETE',
      })

      delete graphStorage.stores[this.props.id]
      this.documentBrowserKey += 1
    }
  }

  async saveGraph(id: string) {
    const store = graphStorage.stores[id]
    if (store) {
      await fetch(`/api/documents/${id}`, {
        method: 'POST',
        body: JSON.stringify(store.data)
      })
    }
  }

  render() {
    const buttonStyles = {
      backgroundColor: 'rgba(25, 25, 25, 0.7)',
      color: 'white',
      border: '1px solid white',
      padding: '8px 15px',
      borderRadius: '8px',
      marginBottom: '8px',
      cursor: 'pointer',
      opacity: 1
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
        {this.store && <EditorView key={this.props.id} store={this.store} /> || <div style={{ color: 'white', backgroundColor: 'rgb(25, 25, 25)', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '24px' }}>Loading...</h2>
        </div>}
      </Viewport>
      <DocumentBrowser selectedId={this.props.id} documentsKey={this.documentBrowserKey} />
      <input value={this.graphName} style={graphNameStyle} onChange={this.changeGraphName} onBlur={this.blurGraphname} />
      <div style={{ position: 'fixed', top: '1vw', right: '1vw', display: 'flex', flexDirection: 'column' }}>
        <button disabled={!this.store} onClick={this.clickSave} style={buttonStyles}>
          Save Graph
        </button>
        <button disabled={!this.store} onClick={this.clickDelete} style={buttonStyles}>
          Delete Graph
        </button>
        <a href="/preview/live" target="_blank" style={buttonStyles}>
          Live Preview
        </a>
        <a href={`/preview/${this.props.id}`} target="_blank" style={buttonStyles}>
          View as Page
        </a>
      </div>
    </div>
  }
}

export default EditorLoad