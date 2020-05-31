import React from 'react'
import { observer } from 'mobx-react'
import { computed, observable, autorun, runInAction, toJS } from 'mobx'
import { Node, Scope, Port, Connection } from '@engine/types'
import { RenderProps, NodeProps, TagLocals, Func } from './types'

import { value, deliveredType } from '@engine/render'
import { inputs } from '@engine/tree'
import { contains } from '@engine/type-functions'
import { transformer } from '@engine/util'


const combineFn = <A, B>(functions: Func<A, B>[]): Func<A, B[]> =>
  (...args) => functions.map(fn => fn(...args))


const HOC = (Component, scope: Scope, node: Node) => {
  @observer
  class RenderComponent extends React.Component {
    @observable children
    @observable properties
    @observable listeners

    constructor(props) {
      super(props)

      // children
      autorun(() => {
        this.children = node.connections.input.input
          ? node.connections.input.input
              .map(input => this.getChild(input.src))
          : []
      })

      // properties
      autorun(() => {
        this.properties = Object.keys(node.connections.input)
          .filter(key => key !== 'input')
          .reduce((obj, key) => ({
            ...obj,
            [key]: node.connections.input[key].length > 0
              ? value(
                node.connections.input[key][0].src.node,
                scope,
                node.connections.input[key][0].src.key)
              : null
          }), {})
      })

      // listeners
      autorun(() => {
        const locals = scope.locals[node.id] as TagLocals
        this.listeners = locals
          ? Object.entries(locals.listeners).reduce((obj, [name, listeners]) => ({
            ...obj,
            [`on${name.charAt(0).toUpperCase()}${name.slice(1)}`]: combineFn(listeners)
          }), {})
          : {}        
      })
    }

    @transformer
    getChild(input: Port) {
      const result = value(input.node, scope, input.key)
      const nodeType = deliveredType(input.node, 'output', scope.context)
      if (contains(nodeType, 'Object') || nodeType.name === 'Boolean') {
        if (contains(deliveredType(input.node, 'output', scope.context), 'Element')) {
          return '{ Complex Object }'
        }
        return JSON.stringify(result)
      }

      return result
    }


    render() {
      return <Component params={node.params} properties={this.properties} listeners={this.listeners}>
        {this.children}
      </Component>
    }
  }

  return RenderComponent
}

export default function(node: Node, Component: React.ComponentType<RenderProps>, scope: Scope): any {
  return React.createElement(HOC(Component, scope, node), { key: Math.random() })
}
