import React from 'react'
import { observer, Provider } from 'mobx-react'
import { observable, computed } from 'mobx'
import fetch from 'isomorphic-fetch'
import Router from 'next/router'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'
import DocumentBrowser from '@components/document-browser'

import Store from '@editor/store'
import graphStorage from '@service/graph-storage'
import LocalStorageSync from '@service/local-storage-sync'
import ServerSync from '@service/server-sync'

import './editor.scss'

const isServer = typeof window === 'undefined'

interface Props {
  id: string
  data: any
}

@observer
class EditorLoad extends React.Component<Props> {
  static async getInitialProps(ctx) {
    return {
      id: ctx.query.id
    }
  }

  localStorageSync: LocalStorageSync
  serverSync: ServerSync
  @computed get store(): Store | undefined {
    return graphStorage.stores[this.props.id]
  }

  @computed get graphName(): string {
    return (this.store || { name: '' }).name
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.localStorageSync.setStoreId(this.props.id)
      await this.serverSync.load(this.props.id)
    }
  }

  componentDidMount() {
    this.localStorageSync = new LocalStorageSync()
    this.localStorageSync.enableSending()
    this.localStorageSync.enableReceiving()
    this.localStorageSync.setStoreId(this.props.id)

    this.serverSync = new ServerSync()
    this.serverSync.enableSaving()

    this.serverSync.load(this.props.id)
  }

  componentWillUnmount() {
    this.localStorageSync.disableSending()
    this.localStorageSync.disableReceiving()
    this.serverSync.disableSaving()
  }

  changeGraphName = (e) => {
    if (this.store) {
      this.store.name = e.target.value
    }
  }

  clickDelete = async () => {
    await this.deleteGraph()
  }

  async deleteGraph() {
    this.localStorageSync.delete(this.props.id)
    this.serverSync.delete(this.props.id)
    delete graphStorage.stores[this.props.id]
    Router.push('/editor')
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
      <DocumentBrowser selectedId={this.props.id} />
      <input value={this.graphName} style={graphNameStyle} onChange={this.changeGraphName} />
      <div style={{ position: 'fixed', top: '1vw', right: '1vw', display: 'flex', flexDirection: 'column' }}>
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