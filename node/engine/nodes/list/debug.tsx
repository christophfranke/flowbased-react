import React from 'react'
import { observer } from 'mobx-react'
import { RenderProps } from '@engine/types'

export default observer((props: RenderProps) => <pre>
  Array&lt;string&gt; [{React.Children.map(props.children, (child, index) => {
    return <React.Fragment>{index > 0 ? ',\n  ' : '\n  '}{child}</React.Fragment>
  })}
  {'\n'}]
</pre>)
