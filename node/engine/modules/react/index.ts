import React from 'react'
import { observable } from 'mobx'

import PreviewComponent from './preview'
import TagComponent from './tag'
import ObserverComponent from './observer-component'

import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

export const Dependencies = ['Core', 'Array', 'Object']

export const name = 'React'
export type Nodes = 'Tag' | 'Preview'
export const Node: Engine.ModuleNodes<Nodes> = {
  Tag: {
    value: (node: Engine.Node, scope: Engine.Scope, key: string) => {
      if (!scope.locals[node.id]) {
        const component = ObserverComponent(node, TagComponent, scope)
        const listeners = observable({})
        scope.locals[node.id] = {
          component,
          listeners,
        }
      }

      if (key === 'output') {
        return scope.locals[node.id].component
      }

      return {
        subscribe: (name: string, fn) => {
          if (!scope.locals[node.id].listeners[name]){
            scope.locals[node.id].listeners[name] = []
          }

          scope.locals[node.id].listeners[name].push(fn)

          return () => {
            scope.locals[node.id].listeners[name] = scope.locals[node.id].listeners[name].filter(ln => ln !== fn)
          }
        }
      }
    },
    type: {
      output: {
        output: () => Type.Element.create(),
        events: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Event.Type.Event.create()
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Core.Type.Unresolved.create(),
        classList: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Array.Type.Array.create(context.modules.Core.Type.String.create()),
        style: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Object.Type.Object.create({}),
        props: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Object.Type.Object.create({})
      }
    }
  },
  Preview: {
    value: (node: Engine.Node, scope: Engine.Scope) =>
      ObserverComponent(node, PreviewComponent, scope),
    type: {
      output: {
        output: () => Type.Element.create(),
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Core.Type.Unresolved.create(),
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Tag: {
    name: 'React Tag',
    type: 'Component',
    documentation: {
      explanation: 'This node create a *React Element*, that will be rendered to an HTML *Tag*, i.e. `<img>` or `<div>`.',
      input: {
        input: 'The children of this *React Element*. They will be placed inside the tag (if allowed), i.e. `<div>{input1}{input2}{etc..}</div>`. Although any type is allowed here, it is currently not possible to render *Objects*, that contain *React Elements*.',
        classList: 'An *Array* of *Strings* for the classes of this *Tag*, i.e. `<div class="{class1} {class2} {etc...}>`',
        style: 'An *Object* that describes the style of this *Tag*, i.e. `<div style="{color: blue, textAlign: center}">`. Please note, that these are used with React and therefore use camel case, instead of the default hyphen case, that is used for CSS.',
        props: 'An *Object*, that describes all additional attributes for this *Tag* in the form `<div {key}="{value}">`, i.e. `<div data-id="15">` or `<img src="/path/to/image.jpg">`'
      },
      params: {
        tag: 'This describes the *Tag* name `<{tagname}></{tagname}>` or `<{tagname}>`, depending on the W3C specification for the tag name. Example: `<div></div>` or `<img>`'
      },
      output: {
        output: 'The *React Element*'
      }
    },
    ports: {
      input: {
        input: ['duplicate'],
        classList: ['side'],
        style: ['side'],
        props: ['side']
      },
      output: {
        events: ['side']
      }
    },
    create: () => ({
      type: 'Tag',
      params: [{
        name: 'Tag',
        key: 'tag',
        value: 'div',
        type: 'text'
      }],      
    })
  },
  Preview: {
    name: 'Preview',
    type: 'Preview',
    options: ['singleton'],
    documentation: {
      explanation: 'This node is used to identify what to render into the preview. There can only be one preview node in a graph, so whenever a new *Preview* is created, the preexisting *Preview* is destroyed.',
      input: {
        input: 'This will be rendered into the preview screen.'
      }
    },
    ports: {
      output: {
        output: ['hidden']
      }
    },
    create: () => ({
      type: 'Preview',
      params: [],
    })
  }
}

export type Types = 'Element'
export const Type: Engine.ModuleTypes<Types> = {
  Element: {
    create: () => ({
      display: 'React Element',
      name: 'Element',
      module: 'React',
      params: {}    
    }),
    emptyValue: () => React.createElement(React.Fragment),
    test: (value) => {
      return React.isValidElement(value)
    }
  }
}
