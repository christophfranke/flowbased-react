import graphStorage from '@service/graph-storage'
import Store from '@editor/store'
import fetch from 'isomorphic-fetch'

const isServer = typeof window === 'undefined'
const base = isServer
  ? 'http://localhost:3000'
  : `${window.location.protocol}//${window.location.host}`

async function fetchStore(id: string) {
  const result = await fetch(`${base}/api/documents/${id}`)
  return await result.json()      
}


export default async function(id) {
  const data = {
    [id]: await fetchStore(id)
  }

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