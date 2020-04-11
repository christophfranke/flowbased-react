import { ValueType } from '@editor/types'

interface ColorMap {
  default: string
  highlight: string
  hover: string
}

export function colorOfType(type: ValueType): ColorMap {
  const key = {
    Number: 'primitive',
    String: 'primitive',
    Boolean: 'primitive',
    Pair: 'primitive',
    Null: 'primitive',
    Array: 'complex',
    Object: 'complex',
    Unresolved: 'unresolved',
    Element: 'render',
    Unknown: 'error',
    Mismatch: 'error'
  }[type.name]

  return colors.types[key]
}

export const colors = {
  connections: 'pink',
  selectionRectangle: 'rgba(255, 192, 203, 0.5)',
  deleteNode: 'rgb(255, 7, 57)',
  nodeList: {
    input: {
      color: 'white',
      background: 'rgba(255, 192, 203, 0.5)'
    },
    text: {
      selected: 'black',
      default: 'white'
    },
    border: 'pink',
    background: {
      default: 'rgba(35, 35, 35, 0.8)',
      selected: 'pink'
    }
  },
  types: {
    render: {
      default: 'rgb(148, 7, 184)',
      highlight: 'rgb(255, 0, 200)',
      hover: 'white'
    },
    primitive: {
      default: 'rgb(14, 201, 195)',
      highlight: 'rgb(28, 255, 255)',
      hover: 'white'
    },
    complex: {
      default: 'rgb(14, 136, 201)',
      highlight: 'rgb(64, 184, 247)',
      hover: 'white'
    },
    error: {
      default: 'rgb(176, 0, 0)',
      highlight: 'rgb(232, 44, 44)',
      hover: 'white'
    },
    unresolved: {
      default: 'rgb(255, 192, 203)',
      highlight: 'rgb(255, 222, 235)',
      hover: 'white'
    }
  },
  background: {
    default: 'rgba(35, 35, 35, 0.8)',
    selected: 'rgba(60, 60, 60, 0.8)',
    editor: 'rgb(15, 15, 15)',
  },
  text: {
    white: 'white',
    mediumDim: 'rgb(170, 130, 140)',
    dim: 'rgb(120, 120, 120)'
  }
}