import * as Engine from '@engine/types'
import * as Editor from '@editor/types'
import { filteredSubForest } from '@engine/tree'
import * as EngineModule from '@engine/module'
import { computedFunction } from '@engine/util'

export const createModule = computedFunction(function (name: string, defines: Engine.Node[]): Editor.Module {
  return {
    ...EngineModule.module(name, defines),
    EditorNode: defines.reduce((obj, define) => {
      return {
        ...obj,
        [`define-${define.id}`]: {
          get name() {
            return (define.params.name && define.params.name.trim()) || 'Anonymous'
          },
          type: 'Local',
          documentation: {
            explanation: 'Locally defined node'
          },
          ports: {
            get input() {
              const forest = filteredSubForest(define, candidate => candidate.type === 'Input')
              return forest.reduce((obj, input) => ({
                ...obj,
                [input.node.params.name]:
                  (input.node.params.side ? ['side'] : [])
                  .concat(input.node.params.duplicate ? ['duplicate'] : [])
              }), {})
            },
            get output() {
              const forest = filteredSubForest(define, candidate => candidate.type === 'Output')
              return forest.reduce((obj, output) => ({
                ...obj,
                [output.node.params.name]:
                  (output.node.params.side ? ['side'] : [])
              }), {
                output: define.params.side ? ['side'] : []
              })
            }
          },
          create: () => ({
            type: `define-${define.id}`,
            params: [{
              name: 'Define',
              key: 'define',
              value: define.id,
              type: 'hidden'
            }]
          })
        }
      }
    }, {})
  }
}, { keepAlive: true })