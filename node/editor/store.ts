import { observable, computed, autorun } from 'mobx'
import { Connection, Node, Connector } from '@editor/types'
import { createInput } from '@editor/connector'

import { flatten } from '@editor/util'

class Store {
  @observable connections: Connection[] = []
  @observable nodes: Node[] = []
  @observable pendingConnector: Connector | null = null
  @computed get connectors(): Connector[] {
    return flatten(flatten(this.nodes.map(node => Object.values(node.connectors))))
  }

  nodeOfConnector(connector: Connector): Node | undefined {
    return this.nodes.find(node => flatten(Object.values(node.connectors))
      .some(con => con === connector))
  }

  // removeInputConnectors = () => {
  //   this.nodes.forEach(node => {
  //     const emptyConnectors = node.connectors.input.filter(connector => connector.connections === 0)
  //     if (emptyConnectors.length > 1) {
  //       node.connectors.input = node.connectors.input
  //         .filter(connector => connector === emptyConnectors[0] || connector.connections > 0)
  //     }
  //   })    
  // }

  addInputConnectors = () => {
    this.nodes.forEach(node => {
      if (node.connectors.input.every(connector => connector.connections > 0)) {
        node.connectors.input.push(createInput())
      }
    })
  }
}

const store = new Store()

autorun(store.addInputConnectors)
// autorun(store.removeInputConnectors)

export default store