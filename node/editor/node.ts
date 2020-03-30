import { Node, Vector } from '@editor/types'
import { uid } from '@editor/util'
import {
  createRenderInput,
  createRenderOutput,
  createValueInput,
  createValueOutput,
  createProperty
} from '@editor/connector'

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