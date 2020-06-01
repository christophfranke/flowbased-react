import Store from '@editor/store'
import { observable, computed, IObservableArray } from 'mobx'

import { flatten } from '@engine/util'
import { Module, Context, Scope } from '@engine/types'
import { module } from '@engine/module'
import { ReactiveContext } from '@engine/context'
import { transformer } from '@engine/util'

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

export class GraphStorage {
  @observable stores: { [key: string]: Store } = {}
  @observable documents: DocumentHead[] = []

  @computed get storeList(): IObservableArray<Store> {
    return observable(Object.values(this.stores))
  }

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
    const modules = { ...defaultModules }
    Object.entries(this.stores).forEach(([key, store]) => {
      Object.defineProperty(modules, key, {
        get: function() {
          return EditorModule.createModule(store.name, store.translated.defines)
        },
        enumerable: true
      })
    })

    return modules
  }

  @computed get modules(): { [key: string]: Module } {
    const modules = { ...defaultModules }
    Object.entries(this.stores).forEach(([key, store]) => {
      Object.defineProperty(modules, key, {
        get: function() {
          return store.translated.export
        },
        enumerable: true
      })
    })

    return modules
  }

  // @observable storeOfNodeCache = {}
  @transformer
  storeOfNode(id: number): Store | undefined  {
    return this.storeList
      .find(store => !!store.nodeMap.hasItem(id))
  }

  @observable context = new ReactiveContext(this)

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