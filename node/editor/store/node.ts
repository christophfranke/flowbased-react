import { Node, Vector } from '@editor/types'
import {
  createRenderInput,
  createRenderOutput,
  createValueInput,
  createValueOutput,
  createProperty
} from '@editor/connector'

import Store from '@editor/store'

export default class NodeFunctions {
  store: Store
  constructor(store: Store) {
    this.store = store
  }

  nodeList = [{
    name: 'List',
    type: 'Transform',
    create: this.createListNode.bind(this)
  }, {
    name: 'Object',
    type: 'Transform',
    create: this.createObjectNode.bind(this)
  }, {
    name: 'Pair',
    type: 'Value',
    create: this.createPairNode.bind(this)
  }, {
    name: 'String',
    type: 'Value',
    create: this.createStringNode.bind(this)
  }, {
    name: 'HTML Element',
    type: 'Render',
    create: this.createTagNode.bind(this)
  }, {
    name: 'Preview',
    type: 'Output',
    create: this.createPreviewNode.bind(this)
  }]

  createPreviewNode(position: Vector): Node {
    const input = createRenderInput()
    input.mode = 'single'

    return {
      id: this.store.uid(),
      name: 'Preview',
      params: [],
      type: 'Preview',
      position,
      connectors: {
        input: [input],
        output: [],
        properties: []
      }
    }
  }

  createListNode(position: Vector): Node {
    return {
      id: this.store.uid(),
      name: 'List',
      params: [],
      position,
      type: 'List',
      connectors: {
        input: [createValueInput('String')],
        output: [createValueOutput('List')],
        properties: []
      }
    }
  }

  createObjectNode(position: Vector): Node {
    return {
      id: this.store.uid(),
      name: 'Object',
      params: [],
      type: 'Object',
      position,
      connectors: {
        input: [createValueInput('Pair')],
        output: [createValueOutput('Object')],
        properties: []
      }
    }
  }

  createPairNode(position: Vector): Node {
    return {
      id: this.store.uid(),
      name: 'Pair',
      params: [{
        name: 'Key',
        key: 'key',
        value: ''
      }, {
        name: 'Value',
        key: 'value',
        value: ''
      }],
      position,
      type: 'Pair',
      connectors: {
        input: [],
        output: [createValueOutput('Pair')],
        properties: []
      }
    }
  }

  createTagNode(position: Vector): Node {
    return {
      id: this.store.uid(),
      name: 'HTML Element',
      params: [{
        name: 'Tag',
        key: 'tag',
        value: 'div'
      }],
      position,
      type: 'Tag',
      connectors: {
        input: [createRenderInput()],
        output: [createRenderOutput()],
        properties: [
          createProperty('classList', 'List'),
          createProperty('style', 'Object'),
          createProperty('props', 'Object')
        ]
      }
    }
  }

  createStringNode(position: Vector): Node {
    return {
      id: this.store.uid(),
      name: 'String',
      params: [{
        name: '',
        key: 'value',
        value: ''
      }],
      position,
      type: 'String',
      connectors: {
        input: [],
        output: [createValueOutput('String')],
        properties: []
      }
    }
  }
}
