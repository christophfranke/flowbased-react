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

export function scale(m: number, v: Vector): Vector {
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

export function product(v: Vector, w?: Vector) {
  return v.x * (w || v).x + v.y * (w || v).y
}

export function distance(v: Vector, w?: Vector) {
  return Math.sqrt(product(v, w))
}

export function rotate90(v: Vector): Vector {
  return {
    x: -v.y,
    y: v.x
  }
}

export function rotate270(v: Vector): Vector {
  return {
    x: v.y,
    y: -v.x
  }
}
