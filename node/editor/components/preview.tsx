import React from 'react'
import { observable, computed, autorun, IReactionDisposer } from 'mobx'
import { observer, inject } from 'mobx-react'

import * as Editor from '@editor/types'
import * as Engine from '@engine/types'
import Translator from '@engine/translator'
import Store from '@editor/store'

import { value } from '@engine/render'
import graphStorage from '@service/graph-storage'

interface Props {
  store: Store
}

@observer
class Preview extends React.Component<Props> {
  store = this.props.store
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

  @computed get sideEffectNodes(): Editor.Node[] {
    return this.store.nodes
      .filter(node => this.store.editorDefinition(node).options
        && this.store.editorDefinition(node).options!.includes('side-effect'))
  }


  componentDidMount() {
    autorun(() => {
      this.dispose.forEach(fn => fn())
      this.dispose = this.sideEffectNodes
        .map(node => autorun(() =>
          value(this.translator.getNode(node.id), graphStorage.scope, 'output')))
    })

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

    return <div>
      Create a Preview node to see a preview
    </div>
  }
}

export default Preview