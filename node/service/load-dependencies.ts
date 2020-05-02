import graphStorage from '@service/graph-storage'
import Store from '@editor/store'
import fetch from 'isomorphic-fetch'

const isServer = typeof window === 'undefined'
const base = isServer
  ? 'http://localhost:3000'
  : `${window.location.protocol}//${window.location.host}`


const fetchPromises = {}
const fetchJson = {}
async function cachedFetchStore(id: string) {
  const url = `${base}/api/documents/${id}`
  if (!fetchPromises[url]) {
    fetchPromises[url] = fetch(url)
    if (fetchJson[url]) {
      delete fetchJson[url]
    }
  }

  const result = await fetchPromises[url]
  delete fetchPromises[url]
  if (!fetchJson[url]) {
    // make sure you only do this once,
    // because dumb stream api cannot do it again
    fetchJson[url] = await result.json()
  }

  return fetchJson[url]
}

export default async function(id) {
  const data = {
    [id]: await cachedFetchStore(id)
  }

  const resolveNodes = nextId => Promise.all<any>(data[nextId].nodes.map(node => {
    if (!graphStorage.modules[node.module] && !data[node.module]) {
      return cachedFetchStore(node.module).then(result => {
        data[node.module] = result
        return resolveNodes(node.module)
      })
    }
    return Promise.resolve()
  }))

  await resolveNodes(id)
  return data
}