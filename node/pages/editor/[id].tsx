import React from 'react'
import { observer, Provider } from 'mobx-react'
import { observable } from 'mobx'
import { withRouter } from 'next/router'
import fetch from 'isomorphic-fetch'

import EditorView from '@editor/components/view'
import Viewport from '@editor/components/viewport'

import Store from '@editor/store'

@(withRouter as any)
@observer
class EditorLoad extends React.Component {
  @observable store: Store
  router = this.props['router']

  async fetchData() {
    const id = this.router.query.id
    const result = await fetch(`/api/documents/${id}`)
    const data = await result.json()
    
    this.store = Store.createFromData(data)
  }

  componentDidMount() {
    this.fetchData()
  }

  render() {
    if (this.store) {
      return <div>
        <Provider store={this.store}>
          <Viewport dimensions={{ x: 0, y: 0, width: 100, height: 100 }}>
            <EditorView />
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