import React from 'react'
import { observable, computed, autorun, IReactionDisposer } from 'mobx'
import { observer, inject } from 'mobx-react'

import * as Editor from '@editor/types'
import * as Engine from '@engine/types'
import Translator from '@engine/translator'

import { value } from '@engine/render'
import graphStorage from '@service/graph-storage'

interface Props {
  store: {
    name: string
    nodes: Editor.Node[]
    connections: Editor.Connection[]
  }
}

@observer
class Preview extends React.Component<Props> {
  store = this.props.store
  ref = React.createRef<HTMLDivElement>()
  dispose: IReactionDisposer[] = []
  translator = new Translator(this.store)
  @observable value: any

  @computed get root(): Engine.Node | undefined {
    return this.preview
      ? this.translator.getNode(this.preview.id)
      : undefined
  }

  @computed get preview(): Editor.Node | undefined {
    return this.store.nodes.find(node => node.type === 'Preview')
  }


  componentDidMount() {
    this.dispose = this.store.nodes
      .filter(node => graphStorage.context.modules[node.module]
        && graphStorage.editorModules[node.module].EditorNode[node.type].options
        && graphStorage.editorModules[node.module].EditorNode[node.type].options!.includes('side-effect'))
      .map(node => autorun(() => value(this.translator.getNode(node.id), graphStorage.scope, 'output')))

    autorun(() => {
      this.value = this.root
        ? value(this.root, graphStorage.scope, 'output')
        : null
    })
  }

  componentWillUnmount() {
    this.dispose.forEach(dispose => dispose())
  }

  render() {
    if (this.preview) {
      return <React.Fragment>
        {this.value}
      </React.Fragment>
    }

    return <div ref={this.ref}>
      Create a Preview node to see a preview
    </div>
  }
}

export default Preview