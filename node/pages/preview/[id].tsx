import React from 'react'
import { observer, Provider } from 'mobx-react'
import { observable, computed } from 'mobx'
import Router, { withRouter } from 'next/router'

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

    return {
      id,
      data
    }
  }

  constructor(props) {
    super(props)
    graphStorage.fillWithData(props.data)
  }

  render() {
    return <Preview store={graphStorage.stores[this.props.id]} />
  }
}

export default EditorLoad