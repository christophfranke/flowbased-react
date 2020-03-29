import { Vector } from '@editor/types'

export function add(v: Vector, w: Vector): Vector {
  return {
    x: v.x + w.x,
    y: v.y + w.y
  }
}

export function madd(v: Vector, m: number, w: Vector): Vector {
  return {
    x: v.x + m * w.x,
    y: v.y + m * w.y    
  }
}

export function multiply(m: number, v: Vector): Vector {
  return {  
    x: m * v.x,
    y: m * v.y
  }
}

export function subtract(v: Vector, w: Vector): Vector {
  return {  
    x: v.x - w.x,
    y: v.y - w.y
  }  
}