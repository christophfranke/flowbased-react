import React from 'react'
import { observer } from 'mobx-react'

import Preview from '@editor/components/preview'

import graphStorage from '@service/graph-storage'
import ServerSync from '@service/server-sync'


interface Props {
  data: any
  id: number
}

@observer
class PagePreview extends React.Component<Props> {
  static async getInitialProps(ctx) {
    const id = ctx.query.id

    const serverSync = new ServerSync()
    await serverSync.load(id)

    return {
      id,
      data: graphStorage.data
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

export default PagePreview