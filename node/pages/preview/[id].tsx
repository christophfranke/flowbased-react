import React from 'react'
import { observer, Provider } from 'mobx-react'
import { observable, computed } from 'mobx'
import Router, { withRouter } from 'next/router'
import fetch from 'isomorphic-fetch'

import Preview from '@editor/components/preview'
import Viewport from '@editor/components/viewport'

import Store from '@editor/store'

import graphStorage from '@service/graph-storage'
import loadDependencies from '@service/load-dependencies'

const currentId = () => window.location.pathname.split('/')[2]

interface Props {
  data: any
  id: number
}

@(withRouter as any)
@observer
class EditorLoad extends React.Component<Props> {
  static async getInitialProps(ctx) {
    const id = ctx.query.id
    const data = await loadDependencies(id)

    console.log(data)

    return {
      id,
      data
    }
  }

  // static async fetchStore(id: string) {
  //   const result = await fetch(`/api/documents/${id}`)
  //   const data = await result.json()      
  //   graphStorage.stores[id] = Store.createFromData(data)

  //   return graphStorage.stores[id]
  // }

  render() {
    Object.entries(this.props.data).forEach(([id, data]) => {
      if (!graphStorage.stores[id]) {
        graphStorage.stores[id] = Store.createFromData(data)
      }
    })

    const store = graphStorage.stores[this.props.id]
    return <Preview store={store} />
  }
}

export default EditorLoad