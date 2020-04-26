import { computed, observable } from 'mobx'

import {
  Connector,
  ConnectorOption,
  ConnectorGroup,
  Ports,
  Connection,
  ConnectorState,
  ConnectorDescription,
  ConnectorFunction,
  ValueType,
  Node,
  Vector
} from '@editor/types'
import Store from '@editor/store'
import { deliveredType, expectedType, numIterators, nodeDefinition } from '@engine/render'
import { canMatch } from '@engine/type-functions'
import { transformer } from '@engine/util'
import { flatFilteredSubForest, children } from '@engine/tree'

import * as Engine from '@engine/types'


export default class ConnectorFunctions {
  readonly store: Store
  constructor(store: Store) {
    this.store = store
  }

  @transformer
  connector<F extends ConnectorFunction>(description: ConnectorDescription<F>): Connector<F> | null {
    const node = this.store.getNodeById(description.nodeId)
    if (!node) {
      console.warn('node not found', description.nodeId)
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
    const portConfig = this.store.editorDefinition(node).ports
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

    const definition = nodeDefinition(node, this.store.context)
    if (!definition) {
      return ports
    }

    ports.input.main = Object.keys(definition.type.input || {})
      .filter(key => !this.connectorOptions(node, 'input', key).includes('side'))
      .map(key => this.createInput(
        key,
        ports,
        this.connectorOptions(node, 'input', key).includes('duplicate')
          ? 'duplicate'
          : 'single',
        { x: 0, y: -1 }
      ))

    ports.input.side = Object.keys(definition.type.input || {})
      .filter(key => this.connectorOptions(node, 'input', key).includes('side'))
      .map(key => this.createInput(
        key,
        ports,
        this.connectorOptions(node, 'input', key).includes('duplicate')
          ? 'duplicate'
          : 'single',
        { x: -1, y: 0 }
      ))

    ports.output.main = Object.keys(definition.type.output || {})
      .filter(key => !this.connectorOptions(node, 'output', key).includes('side'))
      .map(key => this.createOutput(
        key,
        this.hasConnectorOption(node, 'output', key, 'hidden')
          ? 'hidden'
          : 'multiple',
        ports))

    ports.output.side = Object.keys(definition.type.output || {})
      .filter(key => this.connectorOptions(node, 'output', key).includes('side'))
      .map(key => this.createAction(
        key,
        ports))

    return ports
  }

  createInput = (key: string, ports: Ports, mode: 'duplicate' | 'single', direction: Vector): ConnectorGroup<'input', 'single' | 'duplicate'> => {
    const group: ConnectorGroup<'input', 'single' | 'duplicate'> = observable({
      key,
      ports,
      connectors: [],
      mode,
      name: key,
      function: 'input',
      direction,
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

  createAction = (key: string, ports: Ports): ConnectorGroup<'output', 'multiple'> => {
    const group: ConnectorGroup<'output', 'multiple'> = observable({
      key,
      ports,
      connectors: [],
      mode: 'multiple',
      name: key,
      function: 'output',
      direction: { x: 1, y: 0 },
    })

    group.connectors = [{
      group
    }]

    return group
  }

  valuesAreCompatible(src: ConnectorGroup<'output'>, dest: ConnectorGroup<'input'>): boolean {
    const srcType = deliveredType(this.store.translated.getNode(src.ports.node), src.key, this.store.context)
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

  iteratorsAreCompatatible(src: Node, dest: Node): boolean {
    if (numIterators(this.store.translated.getNode(src)) === 0
      || numIterators(this.store.translated.getNode(dest)) === 0) {
      return true
    }

    const destNode = this.store.translated.getNode(dest)
    const dependingChildrenIterator = node => children(node)
      .map(child => flatFilteredSubForest(child, candidate => candidate.type === 'Items'))
      .filter(forest => forest.length > 0)
      .map(forest => forest.find(tree => tree.node))
      .map(tree => tree && tree.node)
      .find(node => node)

    const dependingDest = dependingChildrenIterator(destNode) 
    if (!dependingDest) {
      return true
    }

    const dependingIterator = node => flatFilteredSubForest(node, candidate => candidate.type === 'Items')
      .find(tree => tree.node)!.node
    const dependingSrc = dependingIterator(this.store.translated.getNode(src))
    if (dependingSrc && dependingDest.id === dependingSrc.id) {
      return true
    }

    return false
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
      && this.iteratorsAreCompatatible(src.group.ports.node, dest.group.ports.node)
  }

  state(connector: Connector): ConnectorState {
    if (this.store.pendingConnector) {
      if (this.areSame(this.description(this.store.pendingConnector), this.description(connector))) {
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
