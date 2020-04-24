import React from 'react'
import { observer, Provider } from 'mobx-react'
import { observable, computed } from 'mobx'
import Router, { withRouter } from 'next/router'
import fetch from 'isomorphic-fetch'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'

import Store from '@editor/store'

@(withRouter as any)
@observer
class EditorLoad extends React.Component {
  @observable store: Store
  @observable loading = false

  @observable savedId: null
  @computed get id():string {
    return this.router.query.id || Router.query.id || this.savedId
  }
  router = this.props['router']

  clickSave = async () => {
    this.loading = true
    await this.saveData()
    this.loading = false
  }

  async saveData() {
    if (this.id) {    
      const result = await fetch(`/api/documents/${this.id}`, {
        method: 'POST',
        body: JSON.stringify(this.store.data)
      })
      console.log(result)
    }
  }

  async fetchData() {
    if (this.id) {    
      const result = await fetch(`/api/documents/${this.id}`)
      const data = await result.json()
      
      this.store = Store.createFromData(data)
    } else {
      console.log(this.router, this.router.asPath, this.router.query)
    }
  }

  componentDidMount() {
    // we have to do it this really stupid way
    // because otherwise the router wont give away the real url
    requestAnimationFrame(() => {
      this.savedId = Router.query.id || this.router.id
      this.fetchData()
    })
  }

  render() {
    if (this.store) {
      return <div>
        <Provider store={this.store}>
          <Viewport dimensions={{ x: 0, y: 0, width: 100, height: 100 }}>
            <EditorView />
          </Viewport>
        </Provider>
        <div style={{ position: 'fixed', top: '1vw', right: '1vw' }}>
          <button disabled={this.loading} onClick={this.clickSave} style={{ backgroundColor: 'pink', padding: '8px 15px', borderRadius: '8px', cursor: this.loading ? 'progress' : 'pointer' }}>
            {this.loading ? '...' : 'Save'}
          </button>
        </div>
      </div>

    }

    return <div>
      loading...
    </div>
  }
}

export default EditorLoad