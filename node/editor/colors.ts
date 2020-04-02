export function colorOfNodeType(nodeType: string) {
  return {
    Preview: 'render',
    Tag: 'render',
    Blank: 'value',
    Text: 'value',
    Object: 'value',
    Pair: 'value',
    List: 'value'
  }[nodeType]
}

export function colorOfValueType(valueType: string) {
  return {
    Element: 'render',
    Text: 'value',
    Pair: 'value',
    List: 'value',
    Object: 'value',
    Nothing: 'value'
  }[valueType]
}

export const colors = {
  connections: 'pink',
  nodeList: {
    input: {
      color: 'white',
      background: 'rgba(255,192,203, 0.5)'
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
      default: 'rgb(167, 0, 209)',
      highlight: 'rgb(255, 0, 200)',
      hover: 'white'
    },
    value: {
      default: 'rgb(0, 188, 209)',
      highlight: 'rgb(28, 255, 255)',
      hover: 'white'
    }
  },
  background: {
    default: 'rgba(35, 35, 35, 0.8)'
  },
  text: {
    white: 'white',
    dim: 'rgb(100, 100, 100)'
  }
}