import graphStorage from '@service/graph-storage'
import Store from '@editor/store'

async function fetchStore(id: string) {
  const result = await fetch(`/api/documents/${id}`)
  const data = await result.json()      
  graphStorage.stores[id] = Store.createFromData(data)

  return graphStorage.stores[id]
}


export default async function(store) {
  await Promise.all<any>(store.nodes.map(node => {
    if (!graphStorage.modules[node.module]) {
      return fetchStore(node.module)
    }
    return Promise.resolve()
  }))  
}