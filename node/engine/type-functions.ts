import { Node, ValueType, ValueBaseType } from '@engine/types'
import * as TypeDefinition from '@engine/type-definition'
import Nodes from '@engine/nodes'
import { expectedType } from '@engine/render'

export function create(name: ValueBaseType, args?: any): ValueType {
  if (!isGeneric(name)) {
    return TypeDefinition[name] as ValueType
  }

  return (TypeDefinition[name] as (args: any) => ValueType)(args)
}

export function isGeneric(name: ValueBaseType): boolean {
  return !['String', 'Number', 'Boolean', 'Unresolved', 'Element', 'Null'].includes(name)
}

export function isMismatch(type: ValueType): boolean {
  if (type.name === 'Mismatch') {
    return true
  }

  if (Object.values(type.params).some(paramType => isMismatch(paramType))) {
    return true
  }

  return false
}

export function canMatch(src: ValueType, target: ValueType): boolean {
  return !isMismatch(matchType(src, target))
}

export function matchType(src: ValueType, target: ValueType): ValueType {
  if (src.name === 'Mismatch' || target.name === 'Mismatch') {
    return TypeDefinition.Mismatch
  }
  if (src.name === 'Unresolved') {
    return target
  }
  if (target.name === 'Unresolved') {
    return src
  }

  if (src.name === target.name) {
    const name = src.name

    if (!isGeneric(name)) {
      return create(name)
    }

    if (name === 'Array') {
      return create('Array', matchType(src.params.items, target.params.items))
    }

    if (name === 'Pair') {
      return create('Pair', matchType(src.params.value, target.params.value))
    }

    if (name === 'Object') {
      const params = Object.keys(src.params)
        .map(key => ({
          key,
          type: target.params[key]
            ? matchType(src.params[key], target.params[key])
            : src.params[key]
        }))
        .concat(Object.keys(target.params)
          .filter(key => !src.params[key])
          .map(key => ({
            key,
            type: TypeDefinition.Mismatch
          })))
        .reduce((obj, { key, type }) => ({
          ...obj,
          [key]: type
        }), {})

       return create('Object', params)
    }

    throw new Error(`Unknown generic type ${name}`)
  }

  return TypeDefinition.Mismatch
}