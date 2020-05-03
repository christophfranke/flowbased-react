import { computed, observable } from 'mobx'
import { Node, Vector, EditorDefinition } from '@editor/types'

import { expectedType, deliveredType, nodeDefinition } from '@engine/render'
import { canMatch } from '@engine/type-functions'
import { flatten } from '@engine/util'
import Store from '@editor/store'

interface NodeListItem {
  name: string
  typeDisplay: string
  type: string
  module: string
  moduleName: string
  create: (position: Vector) => void
}

export default class NodeFunctions {
  store: Store
  constructor(store: Store) {
    this.store = store
  }


  @computed get nodeList(): NodeListItem[] {
    const list = flatten(Object.entries(this.store.modules)
      .map(([module, definitions]) =>
        Object.entries(definitions.EditorNode)
          .filter(([type, editorDefinition]) => !(editorDefinition.options && editorDefinition.options.includes('nocreation')))
          .map(([type, editorDefinition]: [string, EditorDefinition]) => ({
            name: editorDefinition.name,
            typeDisplay: editorDefinition.type,
            type,
            module,
            moduleName: definitions.name,
            create: position => this.createNode(position, module, type)
          }))))
          .filter(item => this.canConnectPending(item))

    return list.sort((a, b) => {
      if (a.module === b.module) {
        return a.name < b.name ? -1 : 1
      }
      return a.module < b.module ? -1 : 1
    })
  }

  canConnectPending(nodeListItem: NodeListItem): boolean {
    const node = this.createNodeData({ x: 0, y: 0 }, nodeListItem.module, nodeListItem.type)
    const translated = {
      ...node,
      params: node.params.reduce((obj, param) => ({
        ...obj,
        [param.key]: param.value
      }), {}),
      connections: {
        input: {},
        output: {}
      }
    }

    if (this.store.pendingConnector) {
      const definition = nodeDefinition(node, this.store.context)

      if (this.store.pendingConnector.group.function === 'input') {
        const pendingType = expectedType(
          this.store.translated.getNode(this.store.pendingConnector.group.ports.node.id),
          this.store.pendingConnector.group.key,
          this.store.context)

        return Object.keys(definition.type.output || {})
          .filter(key => !this.store.connector.hasConnectorOption(node, 'output', key, 'hidden'))
          .some(key => canMatch(
            deliveredType(translated, key, this.store.context),
            pendingType,
            this.store.context
          ))
      }

      if (this.store.pendingConnector.group.function === 'output') {
        const pendingType = deliveredType(
          this.store.translated.getNode(this.store.pendingConnector.group.ports.node.id),
          this.store.pendingConnector.group.key,
          this.store.context)

        return Object.keys(definition.type.input || {})
          .filter(key => !this.store.connector.hasConnectorOption(node, 'input', key, 'hidden'))
          .some(key => canMatch(
            pendingType,
            expectedType(translated, key, this.store.context),
            this.store.context
          ))
      }
    }
    return true
  }

  createNodeData(position: Vector, module: string, name: string): Node {
    const editorDefinition = this.store.editorDefinition({ type: name, module })

    return {
      ...editorDefinition.create(),
      module,
      zIndex: 1,
      id: this.store.uid(),
      position
    }
  }

  createNode(position: Vector, module: string, name: string): Node {
    const node = observable(this.createNodeData(position, module, name))

    const editorDefinition = this.store.editorDefinition({ type: name, module })
    if (editorDefinition.options && editorDefinition.options.includes('singleton')) {
      const singletonNodes = this.store.nodes.filter(node => node.type === name)
      this.store.deleteNodes(singletonNodes)
    }

    this.store.nodes.push(node)

    return node
  }
}
