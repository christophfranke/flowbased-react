import { ValueType } from '@editor/types'
import { isMismatch } from '@engine/type-functions'

interface ColorMap {
  default: string
  highlight: string
  hover: string
}

export function colorOfType(type: ValueType): ColorMap {
  // if (isMismatch(type)) {
  //   return colors.types.error
  // }
  const key = {
    Number: 'primitive',
    String: 'primitive',
    Boolean: 'primitive',
    Pair: 'primitive',
    Array: 'complex',
    Object: 'complex',
    EventData: 'complex',
    Unresolved: 'unresolved',
    Element: 'render',
    Null: 'unknown',
    Output: 'unknown',
    Unknown: 'unknown',
    Mismatch: 'error',
    Trigger: 'trigger',
    EventEmitter: 'trigger'
  }[type.name]

  if (!key) {
    console.warn(type)
    return colors.types.error
  }

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
      highlight: 'rgb(209, 35, 252)',
      hover: 'white'
    },
    primitive: {
      default: 'rgb(14, 201, 195)',
      highlight: 'rgb(42, 245, 238)',
      hover: 'white'
    },
    complex: {
      default: 'rgb(70, 136, 227)',
      highlight: 'rgb(89, 158, 255)',
      hover: 'white'
    },
    trigger: {
      default: 'rgb(180, 219, 118)',
      highlight: 'rgb(207, 242, 150)',
      hover: 'white'
    },
    error: {
      default: 'rgb(191, 0, 0)',
      highlight: 'rgb(217, 30, 30)',
      hover: 'white'
    },
    unresolved: {
      default: 'rgb(255, 192, 203)',
      highlight: 'rgb(255, 222, 235)',
      hover: 'white'
    },
    unknown: {
      default: 'rgb(212, 157, 80)',
      highlight: 'rgb(250, 187, 100)',
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