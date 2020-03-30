import { Node, Vector } from '@editor/types'
import { uid } from '@editor/util'
import {
  createRenderInput,
  createRenderOutput,
  createValueInput,
  createValueOutput,
  createProperty
} from '@editor/connector'

export function createObjectNode(position: Vector): Node {
  return {
    id: uid(),
    name: 'Object',
    params: [],
    position,
    connectors: {
      input: [createValueInput('Pair')],
      output: [createValueOutput('Object')],
      properties: []
    }
  }
}

export function createPairNode(position: Vector): Node {
  return {
    id: uid(),
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
    connectors: {
      input: [createValueInput('Pair')],
      output: [createValueOutput('Pair')],
      properties: [
        createProperty('key', 'Text'),
        createProperty('value', 'Text')
      ]
    }
  }
}

export function createHtmlNode(position: Vector): Node {
  return {
    id: uid(),
    name: 'HTML Element',
    params: [{
      name: 'Tag',
      key: 'tag',
      value: 'div'
    }],
    position,
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

export function createTextNode(position: Vector): Node {
  return {
    id: uid(),
    name: 'Text',
    params: [{
      name: '',
      key: 'default',
      value: ''
    }],
    position,
    connectors: {
      input: [createValueInput('Text')],
      output: [createValueOutput('Text')],
      properties: []
    }
  }
}

export function createRandomNode(position: Vector): Node {
  const factories = [createHtmlNode, createTextNode, createPairNode, createObjectNode]
  const func = factories[Math.floor(Math.random() * factories.length)]

  return func(position)
}