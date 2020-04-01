import { computed } from 'mobx'

import { Connector, Connection, ConnectorState, ValueType } from '@editor/types'
import { uid } from '@editor/util'
import store from '@editor/store'

function functionsAreCompatible(src: Connector, dest: Connector): boolean {
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

function valuesAreCompatible(src: Connector, dest: Connector): boolean {
  if (dest.type === 'Element') {
    return true
  }

  if (src.type === dest.type) {
    return true
  }

  return false
}

export function isSrc(connector: Connector): boolean {
  return ['action', 'output'].includes(connector.function)
}

export function canConnect(pending: Connector, possiblyHot: Connector): boolean {
  const src = isSrc(pending) ? pending : possiblyHot
  const dest = isSrc(possiblyHot) ? pending : possiblyHot
  
  return src !== dest
    && store.nodeOfConnector(src) !== store.nodeOfConnector(dest)
    && !(src.mode === 'multiple' && dest.mode === 'multiple')
    && functionsAreCompatible(src, dest)
    && valuesAreCompatible(src, dest)
}
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

export function getConnections(connector: Connector): Connection[] {
  return store.connections
    .filter(connection => connection.from === connector || connection.to === connector)
}

export function countConnections(connector: Connector): number {
  return getConnections(connector).length
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

export function cloneConnector(src: Connector) {
  return {
    ...src,
    id: uid()
  }
}

export function createRenderInput(): Connector {
  return {
    id: uid(),
    mode: 'reconnect',
    function: 'input',
    type: 'Element',
    name: 'input',
    direction: { x: 0, y: -1 }
  }
}

export function createRenderOutput(): Connector {
  return {
    id: uid(),
    mode: 'multiple',
    name: 'output',
    function: 'output',
    type: 'Element',
    direction: { x: 0, y: 1 }
  }
}

export function createValueInput(type: ValueType): Connector {
  return {
    id: uid(),
    mode: 'reconnect',
    function: 'input',
    type,
    name: type,
    direction: { x: 0, y: -1 }
  }
}

export function createValueOutput(type: ValueType): Connector {
  return {
    id: uid(),
    mode: 'multiple',
    name: type,
    function: 'output',
    type,
    direction: { x: 0, y: 1 }
  }
}