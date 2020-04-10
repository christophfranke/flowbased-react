import { ValueType } from '@engine/types'

export const String: ValueType = {
  display: 'String',
  name: 'String',
  params: {}
}

export const Number: ValueType = {
  display: 'Number',
  name: 'Number',
  params: {}
}

export const Boolean: ValueType = {
  display: 'Boolean',
  name: 'Boolean',
  params: {}
}

export const Pair = (param: ValueType): ValueType => ({
  display: 'Pair<{value}>',
  name: 'Pair',
  params: {
    value: param
  }
})

export const Object = (params: { [key: string]: ValueType }): ValueType => ({
  display: `Object {}`,
  name: 'Object',
  params
})

export const Array = (param: ValueType): ValueType => ({
  display: 'Array<{items}>',
  name: 'Array',
  params: {
    items: param
  }
})

export const Unresolved: ValueType = {
  display: '?',
  name: 'Unresolved',
  params: {}
}

export const Element: ValueType = {
  display: 'HTML',
  name: 'Element',
  params: {}
}

export const Null: ValueType = {
  display: 'Null',
  name: 'Null',
  params: {}
}

export const Mismatch: ValueType = {
  display: 'Mismatch',
  name: 'Mismatch',
  params: {}
}

export const Unknown: ValueType = {
  display: 'Unknown',
  name: 'Unknown',
  params: {}
}
