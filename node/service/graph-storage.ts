import Store from '@editor/store'
import { observable, computed } from 'mobx'

import { flatten } from '@engine/util'
import { Module, Context, Scope } from '@engine/types'
import { module } from '@engine/module'
import Translator from '@engine/translator'

import * as Editor from '@editor/types'
import * as EditorModule from '@editor/store/module'

import * as Core from '@engine/modules/core'
import * as React from '@engine/modules/react'
import * as ObjectModule from '@engine/modules/object'
import * as ArrayModule from '@engine/modules/array'
import * as Define from '@engine/modules/define'
import * as Input from '@engine/modules/input'
import * as Javascript from '@engine/modules/javascript'
import * as ErrorModule from '@engine/modules/error'
import * as EventModule from '@engine/modules/event'
import * as StoreModule from '@engine/modules/store'


const defaultModules = {
  Core,
  React,
  Array: ArrayModule,
  Object: ObjectModule,
  Define,
  Input,
  Javascript,
  Error: ErrorModule,
  Event: EventModule,
  Store: StoreModule
}


interface DocumentHead {
  _id: string
  name: string
}

interface Document extends DocumentHead {
}

class GraphStorage {
  @observable stores: { [key: string]: Store } = {}
  @observable documents: DocumentHead[] = []

  defaultContext: Context = {
    modules: defaultModules,
    types: {},
    defines: []
  }

  @computed get data() {
    return Object.entries(this.stores).reduce((obj, [id, store]) => ({
      ...obj,
      [id]: store.data
    }), {})
  }

  @computed get editorModules(): { [key: string]: Editor.Module } {
    return Object.entries(this.stores).reduce((obj, [key, store]) => ({
      ...obj,
      [key]: EditorModule.module(store.name, store.translated.defines)
    }), defaultModules)
  }

  @computed get modules(): { [key: string]: Module } {
    return Object.entries(this.stores).reduce((obj, [key, store]) => ({
      ...obj,
      [key]: store.translated.export
    }), defaultModules)
  }

  @observable storeOfNodeCache = {}
  storeOfNode(id: number): Store | undefined  {
    return Object.values(this.stores)
      .find(store => store.nodes.some(node => node.id === id))
  }

  @computed get context(): Context {
    return {
      modules: this.modules,
      types: {},
      defines: flatten(Object.values(this.stores).map(store => store.translated.defines))
    }
  }

  @computed get scope(): Scope {    
    return {
      locals: {},
      context: this.context,
      parent: null
    }
  }

  fillWithData(storesData) {
    Object.entries(storesData).forEach(([id, data]) => {
      if (!this.stores[id]) {
        this.stores[id] = new Store()
      }

      this.stores[id].fillWithData(data)
    })
  }
}

export default new GraphStorage()