
let id = 0
export const uid:() => number = () => {
  id += 1
  return id
}