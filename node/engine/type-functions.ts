import React from 'react'
import { ValueType, Context } from '@engine/types'

import { expectedType } from '@engine/render'
import { unique } from '@engine/util'

import * as Core from '@engine/modules/core'

export function isGeneric(name: string): boolean {
  return !['EventEmitter', 'EventData', 'Mismatch', 'String', 'Number', 'Boolean', 'Unresolved', 'Element', 'Null', 'Unknown'].includes(name)
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

function isBasic(type: ValueType): boolean {
  return !isGeneric(type.name)
}

function matchBasic(src: ValueType, target: ValueType, context: Context): ValueType | null {
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

  if (isBasic(src) && isBasic(target)) {
    if (src.name === target.name && src.module === target.module) {
      const name = src.name
      const module = src.module
      if (context.modules[module].Type[name]) {
        return context.modules[module].Type[name].create()
      }
    }

    return context.modules.Core.Type.Mismatch.create(`${src.name} is not ${target.name} `)
  }

  return null
}

export function unionAll(types: ValueType[], context: Context): ValueType {
  return types.reduce((result, type) => union(type, result, context), context.modules.Core.Type.Unresolved.create())
}
export function union(src: ValueType, target: ValueType, context: Context): ValueType {
  const basicMatch = matchBasic(src, target, context)
  if (basicMatch) {
    return basicMatch
  }

  if (src.name === target.name && src.module === target.module) {
    const name = src.name
    const module = src.module

    if (name === 'Array' && module === 'Array') {
      return context.modules.Array.Type.Array.create(union(src.params.items, target.params.items, context))
    }

    if (name === 'Trigger' && module === 'Event') {
      return context.modules.Event.Type.Trigger.create(union(src.params.argument, target.params.argument, context))
    }

    if (name === 'Pair' && module === 'Object') {
      return context.modules.Object.Type.Pair.create(union(src.params.value, target.params.value, context))
    }

    if (name === 'Object' && module === 'Object') {
      const srcParams = Object.keys(src.params)
      const targetParams = Object.keys(target.params)
      const keys = unique(srcParams.concat(targetParams))

      const params = keys.map(key => ({
        key,
        type: union(
          src.params[key] || context.modules.Core.Type.Unresolved.create(),
          target.params[key] || context.modules.Core.Type.Unresolved.create(),
          context
        )
      })).reduce((obj, { key, type }) => ({
        ...obj,
        [key]: type
      }), {})

      return context.modules.Object.Type.Object.create(params)
    }

    throw new Error(`Unknown generic type ${name}`)
  }

  return context.modules.Core.Type.Mismatch.create(`${src.name} is not ${target.name}`)
}

export function intersectAll(types: ValueType[], context: Context): ValueType {
  return types.reduce((result, type) => intersect(type, result, context), context.modules.Core.Type.Unresolved.create())
}
export function intersect(src: ValueType, target: ValueType, context: Context): ValueType {
  const basicMatch = matchBasic(src, target, context)
  if (basicMatch) {
    return basicMatch
  }

  if (src.name === target.name && src.module === target.module) {
    const name = src.name
    const module = src.module

    if (name === 'Array' && module === 'Array') {
      return context.modules.Array.Type.Array.create(intersect(src.params.items, target.params.items, context))
    }

    if (name === 'Trigger' && module === 'Event') {
      return context.modules.Event.Type.Trigger.create(intersect(src.params.argument, target.params.argument, context))
    }

    if (name === 'Pair' && module === 'Object') {
      return context.modules.Object.Type.Pair.create(intersect(src.params.value, target.params.value, context))
    }

    if (name === 'Object' && module === 'Object') {
      const srcParams = Object.keys(src.params)
      const targetParams = Object.keys(target.params)
      const keys = srcParams.filter(key => targetParams.includes(key))

      const params = keys.map(key => ({
        key,
        type: intersect(src.params[key], target.params[key], context)
      })).reduce((obj, { key, type }) => ({
        ...obj,
        [key]: type
      }), {})

      return context.modules.Object.Type.Object.create(params)
    }

    throw new Error(`Unknown generic type ${name}`)
  }

  return context.modules.Core.Type.Mismatch.create(`${src.name} is not ${target.name}`)
}

export function matchInto(src: ValueType, target: ValueType, context: Context): ValueType {
  const basicMatch = matchBasic(src, target, context)
  if (basicMatch) {
    return basicMatch
  }

  if (src.name === target.name && src.module === target.module) {
    const name = src.name
    const module = src.module

    if (name === 'Array' && module === 'Array') {
      return context.modules.Array.Type.Array.create(matchInto(src.params.items, target.params.items, context))
    }

    if (name === 'Trigger' && module === 'Event') {
      return context.modules.Event.Type.Trigger.create(matchInto(src.params.argument, target.params.argument, context))
    }

    if (name === 'Pair' && module === 'Object') {
      return context.modules.Object.Type.Pair.create(matchInto(src.params.value, target.params.value, context))
    }

    if (name === 'Object' && module === 'Object') {
      const srcParams = Object.keys(src.params)
      const targetParams = Object.keys(target.params)
      const keys = unique(srcParams.concat(targetParams))

      const params = keys.map(key => ({
        key,
        type: matchInto(
          src.params[key] || context.modules.Core.Type.Mismatch.create(`Expected Object with key ${key}`),
          target.params[key] || context.modules.Core.Type.Unresolved.create(),
          context
        )
      })).reduce((obj, { key, type }) => ({
        ...obj,
        [key]: type
      }), {})

      return context.modules.Object.Type.Object.create(params)
    }

    throw new Error(`Unknown generic type ${name}`)
  }

  return context.modules.Core.Type.Mismatch.create(`${src.name} is not ${target.name}`)
}


export const testValue = function(value: any, type: ValueType, context: Context): boolean {
  return context.modules[type.module].Type[type.name].test(value, type, context)
}

export function createEmptyValue(type: ValueType, context: Context): any {
  return context.modules[type.module].Type[type.name].emptyValue(type, context)
}

