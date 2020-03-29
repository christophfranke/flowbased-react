import { observable, computed } from 'mobx'
import { Connection, Node, Connector } from '@editor/types'

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
}

export default new Store()