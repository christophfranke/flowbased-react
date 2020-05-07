import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, deliveredType, inputValueAt, inputTypeAt } from '@engine/render'
import { inputs } from '@engine/tree'
import { intersectAll, createEmptyValue } from '@engine/type-functions'

export const Dependencies = ['Core', 'Array']

export const name = 'Define'
export type Nodes = 'Define' | 'Proxy' | 'Input' | 'Output'
export const Node: Engine.ModuleNodes<Nodes> = {
  Define: {
    value: (node: Engine.Node, scope: Engine.Scope) =>
      inputValueAt(node, 'input', scope),
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => 
          inputTypeAt(node, 'input', context)
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) =>
          deliveredType(node, 'output', context),
        outputs: (node: Engine.Node, context: Engine.Context) =>
          Type.Output.create(context.modules.Core.Type.Unresolved.create())
      }
    }
  },
  Input: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const input = scope.locals.input && scope.locals.input[node.params.name]

      if (node.params.duplicate) {
        return input && input.length > 0
          ? input.map(input => value(input.src.node, scope.parent || scope, input.src.key))
          : createEmptyValue(deliveredType(node, 'output', (scope.parent || scope).context), (scope.parent || scope).context)
      }

      return input && input.length > 0
        ? value(input[0].src.node, scope.parent || scope, input[0].src.key)
        : createEmptyValue(deliveredType(node, 'output', (scope.parent || scope).context), (scope.parent || scope).context)
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          const inputType = context.types.input && context.types.input[node.params.name]
            ? context.types.input[node.params.name]
            : context.modules.Core.Type.Unresolved.create()

          return node.params.duplicate
            ? context.modules.Array.Type.Array.create(inputType)
            : inputType
        }
      }
    }
  },
  Output: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      return inputValueAt(node, 'input', scope)
    },
    type: {
      input: {
        input: (node: Engine.Node, context: Engine.Context) =>
          context.modules.Core.Type.Unresolved.create()
      },
      output: {
        output: (node: Engine.Node, context: Engine.Context) =>
          inputTypeAt(node, 'input', context),
        define: (node: Engine.Node, context: Engine.Context) =>
          Type.Output.create(inputTypeAt(node, 'input', context))
      }
    }
  },
  Proxy: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const define = scope.context.defines
        .find(other => other.id === Number(node.params.define))

      if (!define) {
        return createEmptyValue(deliveredType(node, 'output', scope.context), scope.context)
      }

      if (!scope.locals[node.id]) {      
        scope.locals[node.id] = {
          scope: {
            ...scope,
            context: {
              ...scope.context,
              types: {
                ...scope.context.types,
                [define.id]: deliveredType(node, 'output', scope.context),
                input: Object.entries(node.connections.input).reduce((obj, [key, group]) => ({
                  ...obj,
                  [key]: intersectAll(
                    group.map(con => deliveredType(con.src.node, con.src.key, scope.context)),
                    scope.context
                  )
                }), {})
              }
            },
            parent: scope,
            locals: {
              ...scope.locals,
              input: node.connections.input
            }
          }
        }
      }


      return value(define, scope.locals[node.id].scope, 'output')
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          const newContext = {
            ...context,
            types: {
              ...context.types,
              input: Object.entries(node.connections.input).reduce((obj, [key, group]) => ({
                ...obj,
                [key]: intersectAll(
                  group.map(con => deliveredType(con.src.node, con.src.key, context)),
                  context
                )
              }), {})
            }
          }

          const define = context.defines
            .find(other => other.id === Number(node.params.define))

          return define
            ? deliveredType(define, 'output', newContext)
            : context.modules.Core.Type.Mismatch.create(`Cannot find define node ${node.params.define}`)
        }
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<'Define' | 'Input' | 'Output'> = {
  Define: {
    name: 'Define',
    type: 'Define',
    documentation: {
      explanation: 'Defines a new node type.',
      input: {
        input: 'The output of the new node type.'
      },
      params: {
        name: 'The name of the new node type. When creating a new node, you can select it using this name.'
      }
    },
    ports: {
      output: {
        output: ['hidden']
      },
      input: {
        outputs: ['side', 'duplicate']
      }
    },
    create: () => ({
      type: 'Define',
      params: [{
        name: 'Name',
        key: 'name',
        value: '',
        type: 'text'
      }],
    })    
  },
  Input: {
    name: 'Input',
    type: 'Input',
    documentation: {
      explanation: 'Defines an input to a node type defined using the *Define* node.',
      output: {
        output: 'This value will be requested by the new node type.'
      },
      params: {
        name: 'The name of the input. Warning: If you change this, any connections to this input may be dangling and eventually lost.',
        side: 'Wether the input will appear on the side or at the top of the node.',
        multiple: 'When this option is selected, the node type will create multiple ports depending on the incmoing connections. The output of this node will be an *Array* of the connected inputs.'
      }
    },
    create: () => ({
      type: 'Input',
      params: [{
        name: 'Name',
        key: 'name',
        value: 'input',
        type: 'text'
      }, {
        name: 'Side',
        key: 'side',
        value: false,
        type: 'checkbox'
      }, {
        name: 'Multiple',
        key: 'duplicate',
        value: false,
        type: 'checkbox'
      }],
    })
  },
  Output: {
    name: 'Output',
    type: 'Output',
    ports: {
      output: {
        output: ['hidden']
      }
    },
    documentation: {
      explanation: 'Defines an output to a node type defined using the *Define* node.',
      input: {
        input: 'This value will be send to the output.'
      },
      params: {
        name: 'The name of the output. Warning: If you change this, any connections to this output may be dangling and eventually lost.',
        side: 'Wether the input will appear on the side or at the top of the node.',
      }
    },
    create: () => ({
      type: 'Output',
      params: [{
        name: 'Name',
        key: 'name',
        value: 'side',
        type: 'text'
      }, {
        name: 'Side',
        key: 'side',
        value: false,
        type: 'checkbox'
      }],
    })
  }
}

export type Types = 'Output'
export const Type: Engine.ModuleTypes<Types> = {
  Output: {
    create: (value: Engine.ValueType) => ({
      display: 'Output <{value}>',
      name: 'Output',
      module: 'Define',
      params: {
        // TODO: Fix types
        // value
      }
    }),
    emptyValue: () => undefined,
    test: value => true
  },
}
