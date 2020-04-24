import React from 'react'
import { observer, Provider } from 'mobx-react'
import { observable, computed } from 'mobx'
import Router, { withRouter } from 'next/router'
import fetch from 'isomorphic-fetch'

import Preview from '@editor/components/preview'
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

  async fetchData() {
    if (this.id) {    
      const result = await fetch(`/api/documents/${this.id}`)
      const data = await result.json()
      
      this.store = Store.createFromData(data)
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
            <Preview />
          </Viewport>
        </Provider>
      </div>

    }

    return <div>
      loading...
    </div>
  }
}

export default EditorLoad