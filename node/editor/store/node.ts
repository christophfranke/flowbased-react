import { Node, Vector } from '@editor/types'
import { CoreNode } from '@engine/types'

import Store from '@editor/store'
import Nodes from '@engine/nodes'

export default class NodeFunctions {
  store: Store
  constructor(store: Store) {
    this.store = store
  }

  nodeList = [{
    name: 'Array',
    type: 'Value',
    create: (position: Vector): Node => this.createNode(position, 'Array')
  }, {
    name: 'Object',
    type: 'Value',
    create: (position: Vector): Node => this.createNode(position, 'Object')
  }, {
    name: 'String',
    type: 'Value',
    create: this.createStringNode.bind(this)
  }, {
    name: 'Pair',
    type: 'Value',
    create: this.createPairNode.bind(this)
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

  createNode(position: Vector, type: CoreNode): Node {
    const Node = Nodes[type]
    const output = {
      'Value': this.store.connector.createValueOutput,
      'React.Component': this.store.connector.createRenderOutput
    }[Node.renderFunction]
    const input = {
      'Value': this.store.connector.createValueInput,
      'React.Component': this.store.connector.createRenderInput
    }[Node.renderFunction]
    const property = this.store.connector.createProperty

    return {
      id: this.store.uid(),
      name: type,
      type,
      params: [],
      position,
      connectors: {
        input: Node.type.input ? [input()] : [],
        output: [output()],
        properties: Object.keys(Node.type.properties)
          .map(key => property(key))
      }
    }
  }

  createPreviewNode(position: Vector): Node {
    const node = this.createNode(position, 'Preview')
    node.connectors.input[0].mode = 'single'
    node.connectors.output = []
    return node
  }

  createPairNode(position: Vector): Node {
    return {
      id: this.store.uid(),
      name: 'Pair',
      params: [{
        name: 'Key',
        key: 'key',
        value: ''
      }],
      position,
      type: 'Pair',
      connectors: {
        input: [this.store.connector.createValueInput({ mode: 'single' })],
        output: [this.store.connector.createValueOutput()],
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
          this.store.connector.createProperty('classList'),
          this.store.connector.createProperty('style'),
          this.store.connector.createProperty('props')
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
        output: [this.store.connector.createValueOutput()],
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
        output: [this.store.connector.createValueOutput()],
        properties: []
      }
    }
  }

  createBooleanNode(position: Vector): Node {
    return {
      id: this.store.uid(),
      name: 'Number',
      params: [{
        name: '',
        key: 'value',
        value: ''
      }],
      position,
      type: 'Boolean',
      connectors: {
        input: [],
        output: [this.store.connector.createValueOutput()],
        properties: []
      }
    }
  }
}
