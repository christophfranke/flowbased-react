import { computed } from 'mobx'

import { Connector, ConnectorState, ValueType } from '@editor/types'
import { uid, canConnect } from '@editor/util'
import store from '@editor/store'

export function state(connector: Connector): ConnectorState {
  if (store.pendingConnector) {
    if (store.pendingConnector === connector) {
      return 'pending'
    }
    if (canConnect(store.pendingConnector, connector)) {
      return 'hot'
    }
  }

  return 'default'
}

export function countConnections(connector: Connector): number {
  return store.connections
    .filter(connection => connection.from === connector || connection.to === connector)
    .length
}

export function createProperty(name: string, type: ValueType): Connector {
  return {
    id: uid(),
    mode: 'reconnect',
    function: 'property',
    name,
    type,
    direction: { x: -1, y: 0 }
  }
}

export function createInput(): Connector {
  return {
    id: uid(),
    mode: 'reconnect',
    function:  'input',
    type: 'Element',
    name: '',
    direction: { x: 0, y: -1 }
  }
}

export function createOutput(): Connector {
  return {
    id: uid(),
    mode: 'multiple',
    name: '',
    function: 'output',
    type: 'Element',
    direction: { x: 0, y: 1 }
  }
}