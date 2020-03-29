import { observable } from 'mobx'
import { Connection, Node } from '@editor/types'

class Store {
  @observable connections: Connection[] = []
  @observable nodes: Node[] = []
}

export default new Store()