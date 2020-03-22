
export default (node, options = {}) => {
  return {
    node,
    name: 'Output',
    position: {
      x: 0,
      y: 0
    },
    movable: true,
    editable: true,
    ...options
  }
}