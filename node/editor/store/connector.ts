import { computed } from 'mobx'

import { Connector, Connection, ConnectorState, ValueType, Node } from '@editor/types'
import Store from '@editor/store'
import { type, expectedType } from '@engine/render'
import { canMatch } from '@engine/type-functions'
import { transformer } from '@shared/util'

export default class ConnectorFunctions {
  store: Store
  constructor(store: Store) {
    this.store = store
  }

  functionsAreCompatible(src: Connector, dest: Connector): boolean {
    if (dest.function === 'input') {
      if (src.function === 'output') {
        return true
      }
    }

    if (dest.function === 'property') {
      if (src.function === 'output') {
        return true
      }
    }

    return false
  }

  valuesAreCompatible(src: Connector, dest: Connector): boolean {
    if (src.function === 'output') {
      const srcNode = this.store.nodeOfConnector(src)
      const targetNode = this.store.nodeOfConnector(dest)
      if (srcNode && targetNode) {
        const srcType = type(this.store.translated.getNode(srcNode))
        const targetKey = dest.name === 'input' ? '' : dest.name
        const targetType = expectedType(this.store.translated.getNode(targetNode), targetKey)
        return canMatch(srcType, targetType)
      }
    }

    return false
  }

  @transformer
  isSrc(connector: Connector): boolean {
    return ['action', 'output'].includes(connector.function)
  }

  willProduceLoop(src?: Node, dest?: Node): boolean {
    return !!src && !!dest && this.store.getSubtree(src).includes(dest)
  }

  canConnect(pending: Connector, possiblyHot: Connector): boolean {
    const src = this.isSrc(pending) ? pending : possiblyHot
    const dest = this.isSrc(possiblyHot) ? pending : possiblyHot

    return src !== dest
      && !this.willProduceLoop(this.store.nodeOfConnector(src), this.store.nodeOfConnector(dest))
      && !(src.mode === 'multiple' && dest.mode === 'multiple')
      && this.functionsAreCompatible(src, dest)
      && this.valuesAreCompatible(src, dest)
  }

  @transformer
  state(connector: Connector): ConnectorState {
    if (this.store.pendingConnector) {
      if (this.store.pendingConnector === connector) {
        return 'pending'
      }
      if (this.canConnect(this.store.pendingConnector, connector)) {
        return 'hot'
      }
    }

    return 'default'
  }

  @transformer
  getConnections(connector: Connector): Connection[] {
    return this.store.connections
      .filter(connection => connection.from === connector || connection.to === connector)
  }

  @transformer
  countConnections(connector: Connector): number {
    return this.getConnections(connector).length
  }

  cloneConnector(src: Connector) {
    return {
      ...src,
      id: this.store.uid()
    }
  }

  createInput = (overrides = {}): Connector => {
    return {
      id: this.store.uid(),
      mode: 'duplicate',
      function: 'input',
      name: 'input',
      direction: { x: 0, y: -1 },
      ...overrides
    }
  }

  createOutput = (): Connector => {
    return {
      id: this.store.uid(),
      mode: 'multiple',
      name: 'output',
      function: 'output',
      direction: { x: 0, y: 1 }
    }
  }

  createProperty = (name: string): Connector => {
    return {
      id: this.store.uid(),
      mode: 'single',
      function: 'property',
      name,
      direction: { x: -1, y: 0 }
    }
  }
}
