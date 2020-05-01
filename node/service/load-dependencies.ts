import graphStorage from '@service/graph-storage'
import Store from '@editor/store'

const base = 'http://localhost:3000'

async function fetchStore(id: string) {
  const result = await fetch(`${base}/api/documents/${id}`)
  return await result.json()      
}


// export default async function(store) {
//   await Promise.all<any>(store.nodes.map(node => {
//     if (!graphStorage.modules[node.module]) {
//       return fetchStore(node.module)
//     }
//     return Promise.resolve()
//   }))  
// }

export default async function(id) {
  const data = {
    [id]: await fetchStore(id)
  }

  console.log(data[id])

  return data

  await Promise.all<any>(data[id].nodes.map(node => {
    if (!graphStorage.modules[node.module] && !data[node.module]) {
      return fetchStore(node.module).then(result => {
        data[node.module] = result
      })
    }
    return Promise.resolve()
  }))

  return data
}