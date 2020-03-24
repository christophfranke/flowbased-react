import React from 'react'

import { Rectangle } from '@editor/types'

interface Props {
  dimensions: Rectangle
}

class Viewport extends React.Component<Props> {
  render() {
    const { dimensions } = this.props
    const style: React.CSSProperties = {
      position: 'fixed',
      left: `${dimensions.x}vw`,
      top: `${dimensions.y}vh`,
      width: `${dimensions.width}vw`,
      height: `${dimensions.height}vh`,
      outline: '1px solid grey'
    }
    return <div style={style}>
      {this.props.children}
    </div>
  }
}

export default Viewport