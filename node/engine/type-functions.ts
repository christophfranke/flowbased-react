import React from 'react'
import { ValueType, Context } from '@engine/types'

import { expectedType, typeDefinition } from '@engine/render'
import { unique } from '@engine/util'

import * as Core from '@engine/modules/core'

export const everyTypeEquals = (a, b) => a.length === b.length && a.every((t, i) => typeEquals(a[i], b[i]))
export function typeEquals(src: ValueType, target: ValueType): boolean {
  if (src.name !== target.name) {
    return false
  }

  const keys = unique(Object.keys(src.params).concat(Object.keys(target.params)))
  return keys.every(key => src.params[key] && target.params[key] && typeEquals(src.params[key], target.params[key]))
}

export function contains(type: ValueType, name: string): boolean {
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

export function canMatch(src: ValueType, target: ValueType, context: Context): boolean {
  return !isMismatch(matchInto(src, target, context))
}

export function combine(src: ValueType, target: ValueType, context: Context, method: string): ValueType {
  if (!src) {
    console.warn('no src type. This is a bug in the type engine or a text programmed module.')
  }
  if (!target) {
    console.warn('no target type. This is a bug in the type engine or a text programmed module.')
  }

  if (!src || !target) {
    console.warn('returned Unresolved')
    return context.modules.Core.Type.Unresolved.create()
  }

  if (src.name === 'Mismatch' && target.name === 'Mismatch') {
    const msg = src.params.msg.display === target.params.msg.display
      ? src.params.msg.display
      : `${src.params.msg.display} and ${target.params.msg.display}`
    return Core.Type.Mismatch.create(msg)
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

  if (src.name === target.name && src.module === target.module) {
    const definition = typeDefinition(src, context)
    if (definition.combine && definition.combine[method]) {
      return definition.combine[method](src, target, context)
    }

    const newType = definition.create()
    Object.keys(src.params).forEach(param => {
      newType.params[param] = combine(src.params[param], target.params[param], context, method)
    })

    return newType
  }

  return context.modules.Core.Type.Mismatch.create(`${src.name} is not ${target.name}`)
}

export function unionAll(types: ValueType[], context: Context): ValueType {
  return types.reduce((result, type) => union(type, result, context), context.modules.Core.Type.Unresolved.create())
}

export function union(src: ValueType, target: ValueType, context: Context): ValueType {
  return combine(src, target, context, 'union')
}

export function intersectAll(types: ValueType[], context: Context): ValueType {
  return types.reduce((result, type) => intersect(type, result, context), context.modules.Core.Type.Unresolved.create())
}

export function intersect(src: ValueType, target: ValueType, context: Context): ValueType {
  return combine(src, target, context, 'intersect')
}


export function matchInto(src: ValueType, target: ValueType, context: Context): ValueType {
  return combine(src, target, context, 'matchInto')
}


export const testValue = function(value: any, type: ValueType, context: Context): boolean {
  return context.modules[type.module].Type[type.name].test(value, type, context)
}

export function createEmptyValue(type: ValueType, context: Context): any {
  return context.modules[type.module].Type[type.name].emptyValue(type, context)
}

