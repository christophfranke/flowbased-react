import { Node, Vector } from '@editor/types'

import Store from '@editor/store'

export default class NodeFunctions {
  store: Store
  constructor(store: Store) {
    this.store = store
  }

  nodeList = [{
    name: 'List',
    type: 'Value',
    create: this.createListNode.bind(this)
  }, {
    name: 'String',
    type: 'Value',
    create: this.createStringNode.bind(this)
  }, {
    name: 'Number',
    type: 'Value',
    create: this.createNumberNode.bind(this)
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
    const input = this.store.connector.createRenderInput()
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
        input: [this.store.connector.createValueInput('String')],
        output: [this.store.connector.createValueOutput('List')],
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
        input: [this.store.connector.createValueInput('Pair')],
        output: [this.store.connector.createValueOutput('Object')],
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
        output: [this.store.connector.createValueOutput('Pair')],
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
        input: [this.store.connector.createRenderInput()],
        output: [this.store.connector.createRenderOutput()],
        properties: [
          this.store.connector.createProperty('classList', 'List'),
          this.store.connector.createProperty('style', 'Object'),
          this.store.connector.createProperty('props', 'Object')
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
        output: [this.store.connector.createValueOutput('String')],
        properties: []
      }
    }
  }

  createNumberNode(position: Vector): Node {
    return {
      id: this.store.uid(),
      name: 'Number',
      params: [{
        name: '',
        key: 'value',
        value: ''
      }],
      position,
      type: 'Number',
      connectors: {
        input: [],
        output: [this.store.connector.createValueOutput('Number')],
        properties: []
      }
    }
  }}
