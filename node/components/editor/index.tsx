import React from 'react'
import { trace } from 'mobx'
import { observer } from 'mobx-react'

import tree from '@store/tree'

@observer
class Editor extends React.Component {
  render() {
    return <div>
      <h2>I am the editor</h2>
      <div>
      </div>
    </div>
  }
}

export default Editor