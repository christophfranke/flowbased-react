import * as Engine from '@engine/types'
import * as Editor from '@editor/types'
import { filteredSubForest } from '@engine/tree'
import * as EngineModule from '@engine/module'

export function module(context: Engine.Context): Editor.Module {
  return {
    ...EngineModule.module(context),
    EditorNode: context.defines.reduce((obj, define) => {
      return {
        ...obj,
        [`define-${define.id}`]: {
          get name() {
            return define.params.name.trim() || 'Anonymous'
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
}