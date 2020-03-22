
export default (node, options = {}) => {
  return {
    node,
    position: {
      x: 0,
      y: 0
    },
    movable: true,
    editable: true,
    ...options
  }
}