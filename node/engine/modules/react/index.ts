import React from 'react'

import PreviewComponent from './preview'
import TagComponent from './tag'
import ObserverComponent from './observer-component'

import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import * as Core from '@engine/modules/core'
// import * as Array from '@engine/modules/array'
// import * as Object from '@engine/modules/object'

export type Nodes = 'Tag' | 'Preview'
export const Node: Engine.ModuleNodes<Nodes> = {
  Tag: {
    value: (node: Engine.Node, scope: Engine.Scope) => ObserverComponent(node, TagComponent, scope),
    type: {
      output: {
        output: () => Type.Element.create(),
      },
      input: {
        input: () => Core.Type.Unresolved.create(),
        // classList: () => Array.Type.Array.create(Core.Type.String),
        // style: () => Object.Type.Object.create({}),
        // props: () => Object.Type.Object.create({})
      }
    }
  },
  Preview: {
    value: (node: Engine.Node, scope: Engine.Scope) => ObserverComponent(node, PreviewComponent, scope),
    type: {
      output: {
        output: () => Type.Element.create(),
      },
      input: {
        input: () => Core.Type.Unresolved.create(),
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Tag: {
    type: 'React',
    create: () => ({
      name: 'JSX Element',
      type: 'Tag',
      params: [{
        name: 'Tag',
        key: 'tag',
        value: '',
        type: 'text'
      }],      
    })
  },
  Preview: {
    type: 'React',
    create: () => ({
      name: 'Preview',
      type: 'Preview',
      params: [],
    })
  }}

export type Types = 'Element'
export const Type: Engine.ModuleTypes<Types> = {
  Element: {
    create: () => ({
      display: 'React Element',
      name: 'Element',
      params: {}    
    }),
    emptyValue: () => React.createElement(React.Fragment),
    test: (value) => {
      console.warn('test for React Element not yet implemented and will always return true')
      return true
    }
  }
}
