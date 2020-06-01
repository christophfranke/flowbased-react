import { observable, computed, IObservableArray, toJS } from 'mobx'

type Filter<T> = (element: T) => boolean
export default class MapStorage<T extends { id: number }> {
  @observable map: { [id: number]: T } = {}

  @computed get list(): IObservableArray<T> {
    return observable(Object.values(this.map))
  }

  filters: { [key: number]: Filter<T> } = {}
  @observable lists: { [key: number]: T[] } = {}

  filteredList(filter: Filter<T>) {
    const key = Math.random()
    if (!this.lists[key]) {
      this.lists[key] = this.list.filter(item => filter(item))
      this.filters[key] = filter
    }

    return this.lists[key]
  }

  add(item: T) {
    this.map[item.id] = item
    Object.entries(this.filters).forEach(([key, filter]) => {
      if (filter(item)) {
        this.lists[key].push(item)
      }
    })
  }

  remove(id: number | string) {
    const item = this.map[id]
    if (item) {    
      Object.entries(this.filters).forEach(([key, filter]) => {
        if (filter(item)) {
          this.lists[key].remove(item)
        }
      })
    }
    
    delete this.map[id]
  }

  getItem(id: number) {
    return this.map[id]
  }

  hasItem(id: number) {
    return !!this.getItem(id)
  }
}