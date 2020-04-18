import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

export type Nodes = 'String' | 'Number' | 'Boolean'
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
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  String: {
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
      name: 'String',
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
      name: 'Number',
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
      name: 'Boolean',
      type: 'Boolean',
      params: [{
        name: '',
        key: 'value',
        value: false,
        type: 'checkbox'
      }],
    })
  },
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
    test: value => true
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
    emptyValue: () => { throw new Error(); },
    test: value => false
  }
}
