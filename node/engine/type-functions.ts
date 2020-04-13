import React from 'react'
import { Node, ValueType, ValueBaseType } from '@engine/types'
import * as TypeDefinition from '@engine/type-definition'
import Nodes from '@engine/nodes'
import { expectedType } from '@engine/render'
import { unique } from '@shared/util'

export function isGeneric(name: ValueBaseType): boolean {
  return !['Mismatch', 'String', 'Number', 'Boolean', 'Unresolved', 'Element', 'Null', 'Unknown'].includes(name)
}

export function contains(type: ValueType, name: ValueBaseType): boolean {  
  if (type.name === name) {
    return true
  }

  if (Object.values(type.params).some(paramType => contains(paramType, name))) {
    return true
  }

  return false
}

export function isMismatch(type: ValueType): boolean {
  return contains(type, 'Mismatch')
}

export function canMatch(src: ValueType, target: ValueType): boolean {
  return !isMismatch(matchInto(src, target))
}

function isBasic(type: ValueType): boolean {
  return !isGeneric(type.name)
}

function matchBasic(src: ValueType, target: ValueType): ValueType | null {
  if (src.name === 'Mismatch' && target.name === 'Mismatch') {
    const msg = src.params.msg.display === target.params.msg.display
      ? src.params.msg.display
      : `${src.params.msg.display} and ${target.params.msg.display}`
    return TypeDefinition.Mismatch(msg)
  }

  if (src.name === 'Unresolved') {
    return target
  }
  if (target.name === 'Unresolved') {
    return src
  }

  if (src.name === 'Mismatch') {
    return src
  }
  if (target.name === 'Mismatch') {
    return target
  }

  if (isBasic(src) && isBasic(target)) {
    if (src.name === target.name) {
      const name = src.name
      if (TypeDefinition[name]) {
        return TypeDefinition[name] as ValueType
      }
    }

    return TypeDefinition.Mismatch(`${src.name} is not ${target.name} `)
  }

  return null
}

export function unionAll(types: ValueType[]): ValueType {
  return types.reduce((result, type) => union(type, result), TypeDefinition.Unresolved)
}
export function union(src: ValueType, target: ValueType): ValueType {
  const basicMatch = matchBasic(src, target)
  if (basicMatch) {
    return basicMatch
  }

  if (src.name === target.name) {
    const name = src.name

    if (name === 'Array') {
      return TypeDefinition.Array(union(src.params.items, target.params.items))
    }

    if (name === 'Pair') {
      return TypeDefinition.Pair(union(src.params.value, target.params.value))
    }

    if (name === 'Object') {
      const srcParams = Object.keys(src.params)
      const targetParams = Object.keys(target.params)
      const keys = unique(srcParams.concat(targetParams))

      const params = keys.map(key => ({
        key,
        type: union(
          src.params[key] || TypeDefinition.Unresolved,
          target.params[key] || TypeDefinition.Unresolved
        )
      })).reduce((obj, { key, type }) => ({
        ...obj,
        [key]: type
      }), {})

      return TypeDefinition.Object(params)
    }

    throw new Error(`Unknown generic type ${name}`)
  }

  return TypeDefinition.Mismatch(`${src.name} is not ${target.name}`)
}

export function intersectAll(types: ValueType[]): ValueType {
  return types.reduce((result, type) => intersect(type, result), TypeDefinition.Unresolved)
}
export function intersect(src: ValueType, target: ValueType): ValueType {
  const basicMatch = matchBasic(src, target)
  if (basicMatch) {
    return basicMatch
  }

  if (src.name === target.name) {
    const name = src.name

    if (name === 'Array') {
      return TypeDefinition.Array(intersect(src.params.items, target.params.items))
    }

    if (name === 'Pair') {
      return TypeDefinition.Pair(intersect(src.params.value, target.params.value))
    }

    if (name === 'Object') {
      const srcParams = Object.keys(src.params)
      const targetParams = Object.keys(target.params)
      const keys = srcParams.filter(key => targetParams.includes(key))

      const params = keys.map(key => ({
        key,
        type: intersect(src.params[key], target.params[key])
      })).reduce((obj, { key, type }) => ({
        ...obj,
        [key]: type
      }), {})

      return TypeDefinition.Object(params)
    }

    throw new Error(`Unknown generic type ${name}`)
  }

  return TypeDefinition.Mismatch(`${src.name} is not ${target.name}`)
}

export function matchInto(src: ValueType, target: ValueType): ValueType {
  const basicMatch = matchBasic(src, target)
  if (basicMatch) {
    return basicMatch
  }

  if (src.name === target.name) {
    const name = src.name

    if (name === 'Array') {
      return TypeDefinition.Array(matchInto(src.params.items, target.params.items))
    }

    if (name === 'Pair') {
      return TypeDefinition.Pair(matchInto(src.params.value, target.params.value))
    }

    if (name === 'Object') {
      const srcParams = Object.keys(src.params)
      const targetParams = Object.keys(target.params)
      const keys = unique(srcParams.concat(targetParams))

      const params = keys.map(key => ({
        key,
        type: matchInto(
          src.params[key] || TypeDefinition.Mismatch(`Expected Object with key ${key}`),
          target.params[key] || TypeDefinition.Unresolved
        )
      })).reduce((obj, { key, type }) => ({
        ...obj,
        [key]: type
      }), {})

      return TypeDefinition.Object(params)
    }

    throw new Error(`Unknown generic type ${name}`)
  }

  return TypeDefinition.Mismatch(`${src.name} is not ${target.name}`)
}

export function createEmptyValue(type: ValueType): any {
  const name = type.name
  if (name === 'Element') {
    return React.createElement(React.Fragment)
  }
  if (name === 'String')  {
    return ''
  }
  if (name === 'Boolean') {
    return false
  }
  if (name === 'Array') {
    return []
  }
  if (name === 'Object') {
    return Object.entries(type.params).reduce((obj, [key, paramType]) => ({
      [key]: createEmptyValue(paramType)
    }), {})
  }
  if (name === 'Number') {
    return 0
  }
  if (name === 'Pair') {
    return {
      key: '',
      value: createEmptyValue(type.params.value)
    }
  }
  if (['Unresolved', 'Null', 'Mismatch', 'Unknown'].includes(name)) {
    return null
  }

  throw new Error(`Unknown base type ${name}`)
}