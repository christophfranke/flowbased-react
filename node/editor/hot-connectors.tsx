import React from 'react'
import { computed } from 'mobx'
import { observer, inject } from 'mobx-react'

import { flatten } from '@editor/util'
import * as LA from '@editor/la'

import { Node, Connector } from '@editor/types'

interface Props {
  nodes: Node[]
}

@inject('mouse')
@observer
class HotConnectors extends React.Component<Props> {
  @computed get hotConnectors(): Connector[] {
    return flatten(flatten(this.props.nodes.map(node => Object.values(node.connectors))))
      .filter(connector => connector.position && connector.state === 'hot')
  }

  handleClick = () => {
    this.hotConnectors.forEach(connector => {
      connector.state = 'empty'
    })
  }

  getNode(connector: Connector): Node | undefined {
    return this.props.nodes.find(node => flatten(Object.values(node.connectors))
      .some(con => con === connector))
  }

  path(connector: Connector): string {
    const node = this.getNode(connector)
    const start = LA.add(node!.position, connector.position!)
    const end = this.props['mouse'].position

    return `M${start.x} ${start.y} L${end.x} ${end.y}`
  }

  render () {
    if (!this.props['mouse'].position) {
      return null
    }

    const style = {
      width: '100%',
      height: '100%',
      outline: '1px solid pink',
    }

    return <svg style={style} onClick={this.handleClick}>
      <g stroke="black" strokeWidth="2">
        {this.hotConnectors.map(connector => <path key={connector.id} d={this.path(connector)} />)}
      </g>
    </svg>
  }
}

export default HotConnectors