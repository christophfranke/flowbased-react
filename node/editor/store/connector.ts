import { computed } from 'mobx'

import { Connector, ConnectorGroup, Ports, Connection, ConnectorState, ValueType, Node } from '@editor/types'
import Store from '@editor/store'
import { type, expectedType } from '@engine/render'
import { canMatch } from '@engine/type-functions'
import { transformer } from '@shared/util'

import * as Engine from '@engine/types'


export default class ConnectorFunctions {
  store: Store
  constructor(store: Store) {
    this.store = store
  }

  @transformer
  ports(node: Node): Ports {
    const ports: Ports = {
      node,
      input: {
        main: [],
        side: []
      },
      output: {
        main: [],
        side: []
      }
    }

    ports.output.main = Object.keys(this.store.definitions.Node[node.type].type.output || {})
      .map(key => this.createOutput(key, ports))

    return ports
  }

  createOutput = (key: string, ports: Ports): ConnectorGroup<'output', 'multiple'> => {
    const group: ConnectorGroup<'output', 'multiple'> = {
      key,
      ports,
      connectors: [],
      mode: 'multiple',
      name: 'output',
      function: 'output',
      direction: { x: 0, y: 1 },
    }

    group.connectors = [{
      group
    }]

    return group
  }

  createTemporaryConnection(src: ConnectorGroup<'output'>, target: ConnectorGroup<'input'>): Engine.Connection {
    return {
      id: -1,
      src: {
        node: this.store.translated.getNode(src.ports.node),
        key: src.key
      },
      target: {
        node: this.store.translated.getNode(target.ports.node),
        key: target.key
      }
    }
  }

  valuesAreCompatible(src: ConnectorGroup<'output'>, dest: ConnectorGroup<'input'>): boolean {
    const srcType = type(this.store.translated.getNode(src.ports.node), this.store.context)
    const targetType = expectedType(
      this.createTemporaryConnection(src, dest),
      this.store.context
    )

    console.warn('valuesAreCompatible not implemented anymore')
    // return canMatch(srcType, targetType)
    return true
  }

  willProduceLoop(src?: Node, dest?: Node): boolean {
    return !!src && !!dest && this.store.getSubtree(src).includes(dest)
  }

  isSrc(group: ConnectorGroup): group is ConnectorGroup<'output'> {
    return group.function === 'output'
  }

  canConnect(pending: Connector, possiblyHot: Connector): boolean {
    const src = this.isSrc(pending.group) ? pending : possiblyHot
    const dest = this.isSrc(pending.group) ? possiblyHot : pending

    return src !== dest
      // && !this.willProduceLoop(this.store.nodeOfConnector(src), this.store.nodeOfConnector(dest))
      && !(src.group.mode === 'multiple' && dest.group.mode === 'multiple')
      && this.valuesAreCompatible(src.group, dest.group)
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
}
