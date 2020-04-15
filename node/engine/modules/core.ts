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
      params: {}
    }),
    emptyValue: () => '',
    test: str => typeof str === 'string'
  },
  Number: {
    create: () => ({
      display: 'Number',
      name: 'Number',
      params: {}
    }),
    emptyValue: () => 0,
    test: value => typeof value === 'number'
  },
  Boolean: {
    create: () => ({
      display: 'Boolean',
      name: 'Boolean',
      params: {}
    }),
    emptyValue: () => false,
    test: value => typeof value === 'boolean'
  },
  Unresolved: {
    create: () => ({
      display: 'Unresolved',
      name: 'Unresolved',
      params: {}
    }),
    emptyValue: () => undefined,
    test: value => true
  },
  Null: {
    create: () => ({
      display: 'Null',
      name: 'Null',
      params: {}
    }),
    emptyValue: () => null,
    test: value => true
  },
  Unknown: {
    create: () => ({
      display: 'Unknown',
      name: 'Unknown',
      params: {}
    }),
    emptyValue: () => undefined,
    test: value => true
  },
  Mismatch: {
    create: (reason: string) => ({  
      display: 'TypeError: {msg}',
      name: 'Mismatch',
      params: {
        msg: {
          display: reason,
          name: 'Null',
          params: {}
        }
      }
    }),
    emptyValue: () => { throw new Error(); },
    test: value => false
  }
}
