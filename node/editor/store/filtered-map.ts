import { observable, computed } from 'mobx'

type Filter<T> = (element: T) => boolean

class FilteredMap<T extends { id: number }> {
  @observable map: { [id: number]: T } = {}

  @computed get list() {
    return Object.values(this.map)
  }

  filters: { [id: number]: Filter<T> } = {}
  @observable lists: { [id: number]: T[] } = {}

  filteredList(filter: Filter<T>) {
    const id = Math.random()
    if (!this.lists[id]) {
     this.lists[id] = this.list.filter(item => filter(item))
    }

    return this.lists[id]
  }

  add(item: T) {
    this.map[item.id] = item
    Object.entries(this.filters).forEach(([id, filter]) => {
      if (filter(item)) {
        this.lists[id].push(item)
      }
    })
  }

  remove(id: number | string) {
    const item = this.map[id]
    
    delete this.map[id]
    Object.entries(this.filters).forEach(([id, filter]) => {
      if (filter(item)) {
        this.lists[id] = this.lists[id].filter(other => other !== item)
      }
    })
  }

  getItem(id: number) {
    return this.map[id]
  }

  hasItem(id: number) {
    return !!this.getItem(id)
  }
}

export default FilteredMap