import React from 'react'
import { observer } from 'mobx-react'
import { RenderProps } from './types'

@observer
class Preview extends React.Component<RenderProps> {
  render() {  
    return <React.Fragment>
      {this.props.children}
    </React.Fragment>
  }
}

export default Preview