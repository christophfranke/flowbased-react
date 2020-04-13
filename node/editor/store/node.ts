import { computed } from 'mobx'
import { Node, Vector } from '@editor/types'
import { CoreNode } from '@engine/types'

import Store from '@editor/store'
import Nodes from '@engine/nodes'

interface nodeListItem {
  name: string
  type: string
  create: (position: Vector) => Node
}

export default class NodeFunctions {
  store: Store
  constructor(store: Store) {
    this.store = store
  }

  @computed get defineList() {
    return this.store.nodes
      .filter(node => node.type === 'Define')
      .map(node => ({
        name: this.getParamValue(node, 'name'),
        type: 'Local',
        create: position => this.createProxy(position, node)
      }))
  }

  @computed get nodeList() {
    return this.defineList.concat([{
      name: 'Array',
      type: 'Complex',
      create: (position: Vector): Node => this.createNode(position, 'Array')
    }, {
      name: 'Collect',
      type: 'Flow',
      create: this.createCollectNode.bind(this)
    }, {
      name: 'If',
      type: 'Flow',
      create: this.createIfNode.bind(this)
    }, {
      name: 'Iterate',
      type: 'Flow',
      create: this.createIterateNode.bind(this)
    }, {
      name: 'Object',
      type: 'Complex',
      create: (position: Vector): Node => this.createNode(position, 'Object')
    }, {
      name: 'Get Key',
      type: 'Complex',
      create: this.createGetKeyNode.bind(this)
    }, {
      name: 'String',
      type: 'Primitive',
      create: this.createStringNode.bind(this)
    }, {
      name: 'Text',
      type: 'Primitive',
      create: this.createTextNode.bind(this)
    }, {
      name: 'Text List',
      type: 'Complex',
      create: this.createTextlistNode.bind(this)
    }, {
      name: 'Text Pairs',
      type: 'Complex',
      create: this.createTextPairsNode.bind(this)
    }, {
      name: 'Boolean',
      type: 'Primitive',
      create: this.createBooleanNode.bind(this)
    }, {
      name: 'Pair',
      type: 'Primitive',
      create: this.createPairNode.bind(this)
    }, {
      name: 'Number',
      type: 'Primitive',
      create: this.createNumberNode.bind(this)
    }, {
      name: 'Define',
      type: 'Core',
      create: this.createDefineNode.bind(this)
    }, {
      name: 'HTML Element',
      type: 'Render',
      create: this.createTagNode.bind(this)
    }, {
      name: 'Preview',
      type: 'Preview',
      create: this.createPreviewNode.bind(this)
    }]).sort((a, b) => {
      if (a.type === b.type) {
        return a.name < b.name ? -1 : 1
      }
      return a.type < b.type ? -1 : 1
    })
  }

  getParamValue(node: Node, key: string): string {
    const nameParam = node.params.find(param => param.key === key)
    return nameParam && nameParam.value
      ? nameParam.value
      : 'Unnamed'
  }

  createProxy(position: Vector, define: Node): Node {
    const getParamValue = () => this.getParamValue(define, 'name')

    return {
      id: this.store.uid(),
      name: getParamValue(),
      type: 'Proxy',
      params: [{
        name: 'Define',
        key: 'define',
        value: define.id,
        type: 'number'
      }],
      position,
      connectors: {
        input: [],
        output: [this.store.connector.createOutput()],
        properties: []
      }
    }
  }

  createNode(position: Vector, type: CoreNode): Node {
    const Node = Nodes[type]
    const property = this.store.connector.createProperty

    return {
      id: this.store.uid(),
      name: type,
      type,
      params: [],
      position,
      connectors: {
        input: Node.type.input ? [this.store.connector.createInput()] : [],
        output: [this.store.connector.createOutput()],
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

  createCollectNode(position: Vector): Node {
    const node = this.createNode(position, 'Collect')
    node.connectors.input[0].mode = 'single'

    return node
  }

  createIfNode(position: Vector): Node {
    const node = this.createNode(position, 'If')
    node.connectors.input.push(this.store.connector.createInput())
    node.connectors.input[0].mode = 'single'
    node.connectors.input[1].mode = 'single'
    node.connectors.input[0].display = 'True'
    node.connectors.input[1].display = 'False'

    return node
  }

  createIterateNode(position: Vector): Node {
    const node = this.createNode(position, 'Iterate')
    node.connectors.input[0].mode = 'single'

    return node
  }

  createDefineNode(position: Vector): Node {
    const node = this.createNode(position, 'Define')
    node.connectors.input[0].mode = 'single'
    node.connectors.output = []
    node.params = [{
      name: 'Name',
      key: 'name',
      value: '',
      type: 'text'
    }]

    return node
  }

  createGetKeyNode(position: Vector): Node {
    const node = this.createNode(position, 'GetKey')
    node.connectors.input[0].mode = 'single'
    node.params = [{
      name: 'Key',
      key: 'key',
      value: '',
      type: 'text'   
    }]

    return node
  }

  createPairNode(position: Vector): Node {
    const node = this.createNode(position, 'Pair')
    node.connectors.input[0].mode = 'single'
    node.params = [{
      name: 'Key',
      key: 'key',
      value: '',
      type: 'text'
    }]

    return node
  }

  createTagNode(position: Vector): Node {
    const node = this.createNode(position, 'Tag')
    node.name = 'HTML Element'
    node.params = [{
      name: 'Tag',
      key: 'tag',
      value: 'div',
      type: 'text'
    }]

    return node
  }

  createStringNode(position: Vector): Node {
    const node = this.createNode(position, 'String')
    node.params = [{
      name: '',
      key: 'value',
      value: '',
      type: 'text'
    }]
    
    return node
  }

  createTextlistNode(position: Vector): Node {
    const node = this.createNode(position, 'Textlist')
    node.name = 'List'
    node.params = [{
      name: '',
      key: 'value',
      value: [],
      type: 'textlist'
    }]

    return node
  }

  createTextPairsNode(position: Vector): Node {
    const node = this.createNode(position, 'TextPairs')
    node.name = 'Pairs'
    node.params = [{
      name: '',
      key: 'value',
      value: {},
      type: 'pairs'
    }]

    return node
  }

  createTextNode(position: Vector): Node {
    const node = this.createStringNode(position)
    node.name = 'Text'
    node.params[0].type = 'textarea'

    return node
  }

  createNumberNode(position: Vector): Node {
    const node = this.createNode(position, 'Number')
    node.params = [{
      name: '',
      key: 'value',
      value: 0,
      type: 'number'
    }]
    
    return node
  }

  createBooleanNode(position: Vector): Node {
    const node = this.createNode(position, 'Boolean')
    node.params = [{
      name: '',
      key: 'value',
      value: false,
      type: 'checkbox'
    }]
    
    return node
  }
}
