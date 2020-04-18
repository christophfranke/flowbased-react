import { computed, observable } from 'mobx'

import { Connector, ConnectorOption, ConnectorGroup, Ports, Connection, ConnectorState, ConnectorDescription, ConnectorFunction, ValueType, Node } from '@editor/types'
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
  connector<F extends ConnectorFunction>(description: ConnectorDescription<F>): Connector<F> | null {
    const node = this.store.getNodeById(description.nodeId)
    if (!node) {
      console.warn('node not found', description)
      return null
    }

    const ports = this.ports(node)
    const group = [...ports[description.function].main, ...ports[description.function].side]
      .find(group => group.key === description.key)

    if (group) {
      return group.connectors[description.slot]
    }

    return null
  }

  @transformer
  description<F extends ConnectorFunction>(connector: Connector<F>): ConnectorDescription<F> {
    return {
      nodeId: connector.group.ports.node.id,
      key: connector.group.key,
      slot: connector.group.connectors.indexOf(connector),
      function: connector.group.function as F
    }
  }

  areSame(one: ConnectorDescription, other: ConnectorDescription): boolean {
    return one.nodeId === other.nodeId
      && one.key === other.key
      && one.slot === other.slot
      && one.function === other.function
  }

  connectorOptions(node: Node, fn: ConnectorFunction, key: string): ConnectorOption[] {
    const portConfig = this.store.modules[node.module].EditorNode[node.type].ports
    if (portConfig) {
      const fnConfig = portConfig[fn]
      if (fnConfig) {
        return fnConfig[key] || []
      }
    }

    return []
  }

  hasConnectorOption(node: Node, fn: ConnectorFunction, key: string, option: ConnectorOption): boolean {
    return this.connectorOptions(node, fn, key).includes(option)
  }

  @transformer
  ports(node: Node): Ports {
    const ports: Ports = observable({
      node,
      input: {
        main: [],
        side: []
      },
      output: {
        main: [],
        side: []
      }
    })

    ports.input.main = Object.keys(this.store.modules[node.module].Node[node.type].type.input || {})
      .filter(key => !this.connectorOptions(node, 'input', key).includes('side'))
      .map(key => this.createInput(
        key,
        ports,
        this.connectorOptions(node, 'input', key).includes('duplicate')
          ? 'duplicate'
          : 'single'
        ))

    ports.input.side = Object.keys(this.store.modules[node.module].Node[node.type].type.input || {})
      .filter(key => this.connectorOptions(node, 'input', key).includes('side'))
      .map(key => this.createProperty(key, ports))

    ports.output.main = Object.keys(this.store.modules[node.module].Node[node.type].type.output || {})
      .map(key => this.createOutput(
        key,
        this.hasConnectorOption(node, 'output', key, 'hidden')
          ? 'hidden'
          : 'multiple',
        ports))

    return ports
  }

  createInput = (key: string, ports: Ports, mode: 'duplicate' | 'single'): ConnectorGroup<'input', 'single' | 'duplicate'> => {
    const group: ConnectorGroup<'input', 'single' | 'duplicate'> = observable({
      key,
      ports,
      connectors: [],
      mode,
      name: key,
      function: 'input',
      direction: { x: 0, y: -1 },
    })

    if (mode === 'single') {    
      group.connectors = [{
        group
      }]
    }

    if (mode === 'duplicate') {
      const numConnectors = this.store.connections
        .filter(connection =>
          connection.target.key === key &&
          connection.target.nodeId === ports.node.id)
        .reduce((max, connection) => Math.max(max, connection.target.slot + 1), 0)
        + 1

      group.connectors = Array(numConnectors).fill(0).map(() => ({
        group
      }))
    }

    return group
  }

  createProperty = (key: string, ports: Ports): ConnectorGroup<'input', 'single'> => {
    const group: ConnectorGroup<'input', 'single'> = observable({
      key,
      ports,
      connectors: [],
      mode: 'single',
      name: key,
      function: 'input',
      direction: { x: -1, y: 0 },
    })

    group.connectors = [{
      group
    }]

    return group
  }

  createOutput = (key: string, mode: 'multiple' | 'hidden', ports: Ports): ConnectorGroup<'output', 'multiple' | 'hidden'> => {
    const group: ConnectorGroup<'output', 'multiple' | 'hidden'> = observable({
      key,
      ports,
      connectors: [],
      mode,
      name: 'output',
      function: 'output',
      direction: { x: 0, y: 1 },
    })

    if (mode === 'multiple') {    
      group.connectors = [{
        group
      }]
    }

    return group
  }

  valuesAreCompatible(src: ConnectorGroup<'output'>, dest: ConnectorGroup<'input'>): boolean {
    const srcType = type(this.store.translated.getNode(src.ports.node), this.store.context)
    const targetType = expectedType(
      this.store.translated.getNode(dest.ports.node),
      dest.key,
      this.store.context
    )

    return canMatch(srcType, targetType, this.store.context)
  }

  willProduceLoop(src?: Node, dest?: Node): boolean {
    return !!src && !!dest && this.store.getSubtree(src).includes(dest)
  }

  @transformer
  isSrc(group: ConnectorGroup): group is ConnectorGroup<'output'> {
    return group.function === 'output'
  }

  canConnect(pending: Connector, possiblyHot: Connector): boolean {
    const src = this.isSrc(pending.group) ? pending : possiblyHot
    const dest = this.isSrc(possiblyHot.group) ? pending : possiblyHot

    return src !== dest
      && !this.willProduceLoop(src.group.ports.node, dest.group.ports.node)
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
      .filter(connection =>
        this.areSame(connection.src, this.description(connector)) ||
        this.areSame(connection.target, this.description(connector)))
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
