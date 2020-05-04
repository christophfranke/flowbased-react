import { toJS } from 'mobx'

import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, deliveredType } from '@engine/render'
import { createEmptyValue, intersectAll } from '@engine/type-functions'
import { inputs, firstInput } from '@engine/tree'

export const Dependencies = []

export const name = 'Core'
export type Nodes = 'String' | 'Number' | 'Boolean' | 'SetType' | 'MatchType' | 'If' | 'Log'
export const Node: Engine.ModuleNodes<Nodes> = {
  String: {
    value: (node: Engine.Node) => node.params.value,
    type: {
      output: {
        output: () => Type.String.create(),
      }
    }
  },
  Number: {
    value: (node: Engine.Node) => parseFloat(node.params.value),
    type: {
      output: {
        output: () => Type.Number.create(),
      }
    }
  },
  Boolean: {
    value: (node: Engine.Node) => !!node.params.value,
    type: {
      output: {
        output: () => Type.Boolean.create(),
      }
    }
  },
  SetType: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const input = node.connections.input.input
        && node.connections.input.input
          .find(connection => connection.target.key === 'input')

      return input
        ? value(input.src.node, scope, input.src.key)
        : createEmptyValue(deliveredType(node, 'output', scope.context), scope.context)
    },
    type: {
      input: {
        type: () => Type.Unresolved.create(),
        input: (node: Engine.Node, context: Engine.Context) => deliveredType(node, 'output', context)
      },
      output: {
        output: (node: Engine.Node, context: Engine.Context) => intersectAll(
          inputs(node).map(input => deliveredType(input.node, input.key, context)),
          context
        )
      }
    }
  },
  MatchType: {
    value: (node: Engine.Node, scope: Engine.Scope) => createEmptyValue(deliveredType(node, 'output', scope.context), scope.context),
    type: {
      input: {
        input: (node: Engine.Node, context: Engine.Context) => deliveredType(node, 'output', context)
      },
      output: {
        output: (node: Engine.Node, context: Engine.Context) => intersectAll(
          inputs(node).map(input => deliveredType(input.node, input.key, context)),
          context
        )
      }
    }
  },
  If: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      const conditionInput = node.connections.input.condition
        && node.connections.input.condition[0]
      const ifTrueInput = node.connections.input.whenTrue
        && node.connections.input.whenTrue[0]
      const ifFalseInput = node.connections.input.whenFalse
        && node.connections.input.whenFalse[0]

      return (conditionInput && value(conditionInput.src.node, scope, conditionInput.src.key))
        ? (ifTrueInput
          ? value(ifTrueInput.src.node, scope, ifTrueInput.src.key)
          : createEmptyValue(deliveredType(node, 'output', scope.context), scope.context))
        : (ifFalseInput
          ? value(ifFalseInput.src.node, scope, ifFalseInput.src.key)
          : createEmptyValue(deliveredType(node, 'output', scope.context), scope.context))
    },
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => intersectAll(
          [node.connections.input.whenTrue, node.connections.input.whenFalse]
            .filter(ports => ports)
            .map(ports => ports[0])
            .filter(port => port)
            .map(port => deliveredType(port.src.node, port.src.key, context)),
          context
        )
      },
      input: {
        whenTrue: (node: Engine.Node, context: Engine.Context) => deliveredType(node, 'output', context),
        whenFalse: (node: Engine.Node, context: Engine.Context) => deliveredType(node, 'output', context),
        condition: () => Type.Boolean.create()
      }
    }
  },
  Log: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      inputs(node).forEach(port => {
        console.log('Log:', toJS(value(port.node, scope, port.key)))
      })
    },
    type: {    
      output: {
        output: (node: Engine.Node, context: Engine.Context) => {
          const input = firstInput(node)
          return input
            ? deliveredType(input.node, input.key, context)
            : Type.Unresolved.create()
        }
      },
      input: {
        input: () => Type.Unresolved.create()
      }
    }
  }
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  String: {
    name: 'String',
    type: 'Value',
    documentation: {
      explanation: 'Creates a *String* value. A *String* is a string of characters (i.e. letters) that form a text.',
      params: {
        value: 'Here you can type in the *String* value'
      },
      output: {
        output: 'The *String*'
      }
    },
    create: () => ({
      type: 'String',
      params: [{
        name: '',
        key: 'value',
        value: '',
        type: 'text'
      }],
    })
  },
  Number: {
    name: 'Number',
    type: 'Value',
    documentation: {
      explanation: 'Creates a *Number* value. This can be any real number, but not infinity.',
      params: {
        value: 'Here you can type in the number. If the number cannot be created or is invalid, the *Number* becomes NaN (Not a Number).'
      },
      output: {
        output: 'The *Number*'
      }
    },
    create: () => ({
      type: 'Number',
      params: [{
        name: '',
        key: 'value',
        value: 0,
        type: 'number'
      }],
    })
  },
  Boolean: {
    name: 'Boolean',
    type: 'Value',
    documentation: {
      explanation: 'Creates a *Boolean* value. A *Boolean* can either be *True* or *False*.',
      params: {
        value: 'Here you can pick a value.'
      },
      output: {
        output: 'The *Boolean*'
      }
    },
    create: () => ({
      type: 'Boolean',
      params: [{
        name: '',
        key: 'value',
        value: false,
        type: 'checkbox'
      }],
    })
  },
  SetType: {
    name: 'Set Type',
    type: 'Type',
    ports: {
      input: {
        type: ['side']
      }
    },
    documentation: {
      explanation: 'This node fixes a type while passing the value from the input to the output.',
      input: {
        input: 'This is the value input. The value will be passed through the node unchanged.',
        type: 'You can input any value here. The value will be ignored, but the type fixes the type of the input and output of this node.'
      },
      output: {
        output: 'Outputs exactly the input'
      }
    },
    create: () => ({
      type: 'SetType',
      params: []
    })
  },
  MatchType: {
    name: 'Match Type',
    type: 'Type',
    ports: {
      input: {
        input: ['duplicate']
      },
      output: {
        output: ['hidden']
      }
    },
    documentation: {
      explanation: 'This node ensures all of its inputs to have the same type.',
      input: {
        input: 'All inputs will be forced to the same type.',
      },
    },
    create: () => ({
      type: 'MatchType',
      params: []
    })
  },
  If: {
    name: 'If',
    type: 'Logic',
    ports: {
      input: {
        condition: ['side']
      }
    },
    documentation: {
      explanation: 'This nodes resolves either to the *whenTrue* or to the *whenFalse* input, depending on the condition.',
      input: {
        whenTrue: 'This input is chosen when the *condition* is *True*',
        whenFalse: 'This input is chosen when the *condition* is *False*',
        condition: 'The condition deciding the output. Defaults to *false*'
      },
      output: {
        output: 'Outputs the selected input.'
      }
    },
    create: () => ({
      type: 'If',
      params: []
    })
  },
  Log: {
    name: 'Log',
    type: 'Console',
    ports: {
      output: {
        output: ['hidden']
      }
    },
    options: ['side-effect'],
    documentation: {
      explanation: 'Logs all inputs to the console. Whenever those values change, they will be logged again.',
      input: {
        input: 'Values to log'
      }
    },
    create: () => ({
      type: 'Log',
      params: []
    })
  }
}

export type Types = 'String'
  | 'Number'
  | 'Boolean'
  | 'Unresolved'
  | 'Null'
  | 'Unknown'
  | 'Mismatch'

export const Type: Engine.ModuleTypes<Types> = {
  String: {
    create: () => ({
      display: 'String',
      name: 'String',
      module: 'Core',
      params: {}
    }),
    emptyValue: () => '',
    test: str => typeof str === 'string'
  },
  Number: {
    create: () => ({
      display: 'Number',
      name: 'Number',
      module: 'Core',
      params: {}
    }),
    emptyValue: () => 0,
    test: value => typeof value === 'number'
  },
  Boolean: {
    create: () => ({
      display: 'Boolean',
      name: 'Boolean',
      module: 'Core',
      params: {}
    }),
    emptyValue: () => false,
    test: value => typeof value === 'boolean'
  },
  Unresolved: {
    create: () => ({
      display: 'Unresolved',
      name: 'Unresolved',
      module: 'Core',
      params: {}
    }),
    emptyValue: () => undefined,
    test: value => true
  },
  Null: {
    create: () => ({
      display: 'Null',
      name: 'Null',
      module: 'Core',
      params: {}
    }),
    emptyValue: () => null,
    test: value => typeof value === 'undefined' || value === null
  },
  Unknown: {
    create: () => ({
      display: 'Unknown',
      name: 'Unknown',
      module: 'Core',
      params: {}
    }),
    emptyValue: () => undefined,
    test: value => true
  },
  Mismatch: {
    create: (reason: string) => ({  
      display: 'TypeError: {msg}',
      name: 'Mismatch',
      module: 'Core',
      params: {
        msg: {
          display: reason,
          name: 'Null',
          module: 'Core',
          params: {}
        }
      }
    }),
    emptyValue: (type: Engine.ValueType) => { throw new Error(type.display); },
    test: value => false
  }
}
