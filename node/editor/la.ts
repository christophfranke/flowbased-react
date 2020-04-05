import { Vector, Rectangle } from '@editor/types'

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

export function round(v: Vector): Vector {
  return {
    x: Math.round(v.x),
    y: Math.round(v.y)
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

export function intersects(r1: Rectangle, r2: Rectangle): boolean {
  return !(r2.x > r1.x + r1.width
    || r2.x + r2.width < r1.x
    || r2.y > r1.y + r1.height
    || r2.y + r2.height < r1.y)
}