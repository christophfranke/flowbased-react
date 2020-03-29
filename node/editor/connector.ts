import { computed } from 'mobx'

import { Connector, ConnectorState } from '@editor/types'
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

export function createInput(): Connector {
  const connector: Connector = {
    id: uid(),
    connections: 0,
    mode: 'reconnect',
    name: '',
    direction: { x: 0, y: -1 }
  }

  return connector
}

export function createOutput(): Connector {
  const connector: Connector = {
    id: uid(),
    connections: 0,
    mode: 'multiple',
    name: '',
    direction: { x: 0, y: 1 }
  }

  return connector
}